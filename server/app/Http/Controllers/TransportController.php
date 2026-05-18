<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransportController extends Controller
{
    /**
     * GET /api/transports — list all or search by route/date
     */
    public function index(Request $request)
    {
        $query = DB::table('transports')->where('status', '!=', 'inactive');

        if ($request->filled('from')) {
            $query->where('from_location', 'like', '%' . $request->from . '%');
        }

        if ($request->filled('to')) {
            $query->where('to_location', 'like', '%' . $request->to . '%');
        }

        if ($request->filled('type')) {
            $query->where('vehicle_type', $request->type);
        }

        if ($request->filled('date')) {
            // Filter by departure date if column exists
            $query->whereDate('departure_time', $request->date);
        }

        $query->orderBy('departure_time', 'asc');

        return response()->json($query->paginate(15));
    }

    /**
     * GET /api/transports/{id}
     */
    public function show($id)
    {
        $transport = DB::table('transports')->where('id', $id)->first();
        if (!$transport) {
            return response()->json(['message' => 'Transport not found.'], 404);
        }
        return response()->json($transport);
    }

    /**
     * GET /api/transports/{id}/availability
     */
    public function availability($id)
    {
        $transport = DB::table('transports')->where('id', $id)->first();
        if (!$transport) {
            return response()->json(['message' => 'Transport not found.'], 404);
        }

        $booked = DB::table('transport_bookings')
            ->where('transport_id', $id)
            ->whereIn('status', ['confirmed', 'pending'])
            ->sum('seats_booked') ?? 0;

        $available = max(0, ($transport->total_seats ?? 0) - $booked);

        return response()->json([
            'transport_id'    => $id,
            'total_seats'     => $transport->total_seats,
            'booked_seats'    => (int) $booked,
            'available_seats' => $available,
            'is_available'    => $available > 0,
        ]);
    }

    /**
     * POST /api/transports — create (Admin only)
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'authority') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $request->validate([
            'vehicle_name'   => 'required|string|max:100',
            'vehicle_type'   => 'required|in:bus,train,taxi,auto,boat',
            'from_location'  => 'required|string|max:100',
            'to_location'    => 'required|string|max:100',
            'departure_time' => 'required|date',
            'arrival_time'   => 'required|date|after:departure_time',
            'total_seats'    => 'required|integer|min:1',
            'price_per_seat' => 'required|numeric|min:0',
        ]);

        $id = DB::table('transports')->insertGetId([
            ...$request->only([
                'vehicle_name', 'vehicle_type', 'from_location', 'to_location',
                'departure_time', 'arrival_time', 'total_seats', 'price_per_seat',
            ]),
            'status'     => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id, 'message' => 'Transport added successfully.'], 201);
    }

    /**
     * PUT /api/transports/{id} — update (Admin only)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'authority') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $transport = DB::table('transports')->where('id', $id)->first();
        if (!$transport) {
            return response()->json(['message' => 'Transport not found.'], 404);
        }

        $request->validate([
            'vehicle_name'   => 'sometimes|string|max:100',
            'vehicle_type'   => 'sometimes|in:bus,train,taxi,auto,boat',
            'from_location'  => 'sometimes|string|max:100',
            'to_location'    => 'sometimes|string|max:100',
            'departure_time' => 'sometimes|date',
            'arrival_time'   => 'sometimes|date',
            'total_seats'    => 'sometimes|integer|min:1',
            'price_per_seat' => 'sometimes|numeric|min:0',
            'status'         => 'sometimes|in:active,inactive,maintenance',
        ]);

        DB::table('transports')->where('id', $id)->update([
            ...$request->only([
                'vehicle_name', 'vehicle_type', 'from_location', 'to_location',
                'departure_time', 'arrival_time', 'total_seats', 'price_per_seat', 'status',
            ]),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Transport updated successfully.']);
    }

    /**
     * POST /api/bookings/transport — book a transport seat
     */
    public function bookTransport(Request $request)
    {
        $request->validate([
            'transport_id' => 'required|exists:transports,id',
            'seats'        => 'required|integer|min:1|max:10',
            'travel_date'  => 'required|date|after_or_equal:today',
        ]);

        // Check availability
        $transport = DB::table('transports')->where('id', $request->transport_id)->first();

        $booked = DB::table('transport_bookings')
            ->where('transport_id', $request->transport_id)
            ->whereIn('status', ['confirmed', 'pending'])
            ->sum('seats_booked') ?? 0;

        $available = ($transport->total_seats ?? 0) - $booked;

        if ($request->seats > $available) {
            return response()->json([
                'message'         => "Only {$available} seats are available.",
                'available_seats' => $available,
            ], 422);
        }

        $totalPrice = ($transport->price_per_seat ?? 0) * $request->seats;

        $id = DB::table('transport_bookings')->insertGetId([
            'user_id'      => $request->user()->id,
            'transport_id' => $request->transport_id,
            'seats_booked' => $request->seats,
            'travel_date'  => $request->travel_date,
            'total_price'  => $totalPrice,
            'status'       => 'confirmed',
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        return response()->json([
            'booking_id'  => $id,
            'seats'       => $request->seats,
            'total_price' => $totalPrice,
            'message'     => 'Transport booked successfully.',
        ], 201);
    }

    /**
     * PATCH /api/transports/{id}/load — update current load (for real-time)
     */
    public function updateLoad(Request $request, $id)
    {
        $request->validate(['current_load' => 'required|integer|min:0|max:100']);

        DB::table('transports')->where('id', $id)->update([
            'current_load' => $request->current_load,
            'updated_at'   => now(),
        ]);

        return response()->json(['message' => 'Transport load updated.']);
    }
}
