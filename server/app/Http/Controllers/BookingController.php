<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $bookings = DB::table('bookings')
            ->join('tourist_places', 'bookings.tourist_place_id', '=', 'tourist_places.id')
            ->where('bookings.user_id', $request->user()->id)
            ->select('bookings.*', 'tourist_places.name as place_name', 'tourist_places.image as place_image')
            ->get();

        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tourist_place_id' => 'required|exists:tourist_places,id',
            'booking_date' => 'required|date',
            'number_of_people' => 'required|integer|min:1',
        ]);

        $data = $request->all();
        $data['user_id'] = $request->user()->id;
        $data['status'] = 'pending';
        $data['created_at'] = now();
        $data['updated_at'] = now();

        $id = DB::table('bookings')->insertGetId($data);

        return response()->json(['id' => $id, 'message' => 'Booking created successfully'], 201);
    }
}
