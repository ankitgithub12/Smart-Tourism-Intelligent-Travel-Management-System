<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Events\BookingStatusUpdated;

class BookingController extends Controller
{
    /**
     * GET /api/bookings — list current user's bookings (or all for admin)
     */
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = DB::table('bookings')
            ->join('tourist_places', 'bookings.tourist_place_id', '=', 'tourist_places.id')
            ->select(
                'bookings.*',
                'tourist_places.name as place_name',
                'tourist_places.image as place_image',
                'tourist_places.location as place_location',
                'tourist_places.category as place_category'
            );

        // Admin sees all; others see only their own
        if ($user->role !== 'authority') {
            $query->where('bookings.user_id', $user->id);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('bookings.status', $request->status);
        }

        // Date range filter
        if ($request->filled('from')) {
            $query->where('bookings.booking_date', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->where('bookings.booking_date', '<=', $request->to);
        }

        $bookings = $query->orderBy('bookings.created_at', 'desc')->paginate(15);

        return response()->json($bookings);
    }

    /**
     * POST /api/bookings — create a new booking
     */
    public function store(Request $request)
    {
        $request->validate([
            'tourist_place_id' => 'required|exists:tourist_places,id',
            'booking_date'     => 'required|date|after_or_equal:today',
            'number_of_people' => 'required|integer|min:1|max:50',
            'time_slot'        => 'nullable|string',
            'special_requests' => 'nullable|string|max:500',
        ]);

        // Calculate total price
        $place = DB::table('tourist_places')->where('id', $request->tourist_place_id)->first();
        $totalPrice = ($place->entry_fee ?? 0) * $request->number_of_people;

        $id = DB::table('bookings')->insertGetId([
            'user_id'          => $request->user()->id,
            'tourist_place_id' => $request->tourist_place_id,
            'booking_date'     => $request->booking_date,
            'time_slot'        => $request->time_slot,
            'number_of_people' => $request->number_of_people,
            'special_requests' => $request->special_requests,
            'total_price'      => $totalPrice,
            'status'           => 'pending',
            'payment_status'   => 'unpaid',
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        $booking = DB::table('bookings')
            ->join('tourist_places', 'bookings.tourist_place_id', '=', 'tourist_places.id')
            ->where('bookings.id', $id)
            ->select('bookings.*', 'tourist_places.name as place_name', 'tourist_places.location as place_location')
            ->first();

        // Send confirmation email (best-effort)
        $this->sendBookingEmail($request->user(), $booking, 'created');

        return response()->json([
            'booking' => $booking,
            'message' => 'Booking created successfully. Confirmation will be sent to your email.',
        ], 201);
    }

    /**
     * GET /api/bookings/{id}
     */
    public function show(Request $request, $id)
    {
        $user    = $request->user();
        $query   = DB::table('bookings')
            ->join('tourist_places', 'bookings.tourist_place_id', '=', 'tourist_places.id')
            ->where('bookings.id', $id)
            ->select('bookings.*', 'tourist_places.name as place_name', 'tourist_places.image as place_image', 'tourist_places.location as place_location');

        if ($user->role !== 'authority') {
            $query->where('bookings.user_id', $user->id);
        }

        $booking = $query->first();

        if (!$booking) {
            return response()->json(['message' => 'Booking not found or unauthorized.'], 404);
        }

        return response()->json($booking);
    }

    /**
     * PUT /api/bookings/{id} — update booking (pending only)
     */
    public function update(Request $request, $id)
    {
        $booking = DB::table('bookings')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$booking) {
            return response()->json(['message' => 'Booking not found or unauthorized.'], 404);
        }

        if ($booking->status !== 'pending') {
            return response()->json(['message' => 'Only pending bookings can be modified.'], 422);
        }

        $request->validate([
            'booking_date'     => 'sometimes|date|after_or_equal:today',
            'number_of_people' => 'sometimes|integer|min:1|max:50',
            'time_slot'        => 'nullable|string',
            'special_requests' => 'nullable|string|max:500',
        ]);

        DB::table('bookings')->where('id', $id)->update([
            ...$request->only(['booking_date', 'number_of_people', 'time_slot', 'special_requests']),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Booking updated successfully.']);
    }

    /**
     * POST /api/bookings/{id}/confirm — Admin/Agency confirms booking
     */
    public function confirm(Request $request, $id)
    {
        $user = $request->user();
        if (!in_array($user->role, ['authority', 'agency'])) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($user->role === 'agency' && ($user->approval_status !== 'approved' || $user->deactivated_at)) {
            return response()->json(['message' => 'Your travel agency account requires City Authority approval.'], 403);
        }

        $booking = DB::table('bookings')
            ->join('tourist_places', 'bookings.tourist_place_id', '=', 'tourist_places.id')
            ->where('bookings.id', $id)
            ->select('bookings.*', 'tourist_places.name as place_name')
            ->first();
        if (!$booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        if ($booking->status !== 'pending') {
            return response()->json(['message' => "Cannot confirm a booking with status '{$booking->status}'."], 422);
        }

        DB::table('bookings')->where('id', $id)->update([
            'status'     => 'confirmed',
            'updated_at' => now(),
        ]);

        // Notify tourist
        $tourist = DB::table('users')->where('id', $booking->user_id)->first();
        if ($tourist) {
            $this->sendBookingEmail($tourist, $booking, 'confirmed');
            
            // Real-time broadcast
            event(new BookingStatusUpdated($booking, 'confirmed', $booking->user_id));
        }

        return response()->json(['message' => 'Booking confirmed successfully.']);
    }

    /**
     * POST /api/bookings/{id}/cancel — user or admin cancels
     */
    public function cancel(Request $request, $id)
    {
        $user = $request->user();

        $query = DB::table('bookings')
            ->join('tourist_places', 'bookings.tourist_place_id', '=', 'tourist_places.id')
            ->where('bookings.id', $id)
            ->select('bookings.*', 'tourist_places.name as place_name');
            
        if ($user->role !== 'authority') {
            $query->where('bookings.user_id', $user->id);
        }

        $booking = $query->first();

        if (!$booking) {
            return response()->json(['message' => 'Booking not found or unauthorized.'], 404);
        }

        if ($booking->status === 'completed') {
            return response()->json(['message' => 'Completed bookings cannot be cancelled.'], 422);
        }

        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'Booking is already cancelled.'], 422);
        }

        $paymentStatus = $booking->payment_status === 'paid' ? 'refunded' : $booking->payment_status;

        DB::table('bookings')->where('id', $id)->update([
            'status'         => 'cancelled',
            'payment_status' => $paymentStatus,
            'cancelled_at'   => now(),
            'updated_at'     => now(),
        ]);

        // Notify tourist
        $tourist = DB::table('users')->where('id', $booking->user_id)->first();
        if ($tourist) {
            $this->sendBookingEmail($tourist, $booking, 'cancelled');
            
            // Real-time broadcast
            event(new BookingStatusUpdated($booking, 'cancelled', $booking->user_id));
        }

        return response()->json([
            'message'        => 'Booking cancelled successfully.',
            'payment_status' => $paymentStatus,
        ]);
    }

    /**
     * DELETE /api/bookings/{id} — alias for cancel
     */
    public function destroy(Request $request, $id)
    {
        return $this->cancel($request, $id);
    }

    /**
     * GET /api/bookings/{id}/receipt
     */
    public function receipt(Request $request, $id)
    {
        $booking = DB::table('bookings')
            ->join('tourist_places', 'bookings.tourist_place_id', '=', 'tourist_places.id')
            ->join('users', 'bookings.user_id', '=', 'users.id')
            ->where('bookings.id', $id)
            ->where('bookings.user_id', $request->user()->id)
            ->select(
                'bookings.*',
                'tourist_places.name as place_name',
                'tourist_places.location as place_location',
                'tourist_places.entry_fee',
                'users.name as user_name',
                'users.email as user_email'
            )
            ->first();

        if (!$booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        return response()->json([
            'receipt' => [
                'booking_id'       => $booking->id,
                'user_name'        => $booking->user_name,
                'user_email'       => $booking->user_email,
                'place_name'       => $booking->place_name,
                'place_location'   => $booking->place_location,
                'booking_date'     => $booking->booking_date,
                'time_slot'        => $booking->time_slot,
                'number_of_people' => $booking->number_of_people,
                'total_price'      => $booking->total_price,
                'status'           => $booking->status,
                'payment_status'   => $booking->payment_status,
                'created_at'       => $booking->created_at,
            ],
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private function sendBookingEmail($user, $booking, string $type): void
    {
        try {
            $subject = match ($type) {
                'created'   => 'Booking Confirmation — Smart Tourism',
                'confirmed' => 'Your Booking is Confirmed! — Smart Tourism',
                'cancelled' => 'Booking Cancellation Notice — Smart Tourism',
                default     => 'Booking Update — Smart Tourism',
            };

            $placeName = $booking->place_name ?? 'a destination';
            Mail::raw(
                "Hello {$user->name},\n\nYour booking for {$placeName} on {$booking->booking_date} has been {$type}.\n\nThank you for using Smart Tourism!",
                
                fn ($m) => $m->to($user->email)->subject($subject)
            );
        } catch (\Exception $e) {
            Log::error('Booking email failed: ' . $e->getMessage());
        }
    }
}
