<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\TripService;
use Illuminate\Http\Request;

class TripController extends Controller
{
    protected $tripService;

    public function __construct(TripService $tripService)
    {
        $this->tripService = $tripService;
    }

    public function index(Request $request)
    {
        $trips = $this->tripService->getUserTrips($request->user()->id);
        return response()->json(['data' => $trips]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'from_location' => 'nullable|string',
            'to_destination' => 'required|string',
            'departure_date' => 'required|date',
            'return_date' => 'required|date|after:departure_date',
            'travelers' => 'required|integer|min:1',
            'hotel_id' => 'nullable|exists:hotels,id',
            'food_package_id' => 'nullable|exists:food_packages,id',
            'cab_service_id' => 'nullable|exists:cab_services,id',
            'guide_id' => 'nullable|exists:guides,id',
            'rental_vehicle_id' => 'nullable|exists:rental_vehicles,id',
            'subtotal' => 'required|numeric',
            'tax' => 'required|numeric',
            'discount' => 'required|numeric',
            'total_price' => 'required|numeric',
        ]);

        $trip = $this->tripService->createTrip($validated, $request->user()->id);

        return response()->json(['message' => 'Trip created successfully', 'data' => $trip], 201);
    }
}
