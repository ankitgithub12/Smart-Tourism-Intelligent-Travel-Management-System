<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Events\AgencyDataUpdated;
use App\Events\NotificationSent;
use App\Http\Controllers\AgencyDashboardController;
use App\Models\AgencyGuide;
use App\Models\AgencyPackage;
use App\Models\AgencyVehicle;
use App\Models\CabService;
use App\Models\FoodPackage;
use App\Models\Hotel;
use App\Models\Trip;
use App\Models\Notification;
use App\Services\TripService;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

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

    public function show(Request $request, $tripId)
    {
        $trip = $this->tripService->getTrip($tripId, $request->user()->id);
        
        if (!$trip) {
            return response()->json(['message' => 'Trip not found'], 404);
        }
        
        return response()->json(['data' => $trip]);
    }

    public function options()
    {
        return response()->json([
            'packages' => AgencyPackage::where('status', 'Active')->latest()->get()->map(fn (AgencyPackage $package) => [
                'id' => $package->id,
                'name' => $package->name,
                'destination' => $package->destination,
                'duration' => $package->duration,
                'duration_days' => $this->durationDays($package->duration),
                'price' => (float) $package->price,
                'image' => $package->image,
            ])->values(),
            'hotels' => Hotel::latest()->get()->map(fn (Hotel $hotel) => [
                'id' => $hotel->id,
                'name' => $hotel->name,
                'stars' => (int) $hotel->stars,
                'price' => (float) $hotel->price_per_night,
                'rating' => (float) $hotel->rating,
                'img' => $hotel->image,
                'amenities' => $hotel->amenities ?: [],
            ])->values(),
            'foodOptions' => FoodPackage::all()->map(fn (FoodPackage $food) => [
                'id' => $food->id,
                'label' => $food->label,
                'emoji' => $food->emoji ?: '',
                'price' => (float) $food->price_per_day,
            ])->values(),
            'cabOptions' => CabService::all()->map(fn (CabService $cab) => [
                'id' => $cab->id,
                'label' => $cab->label,
                'price' => (float) $cab->price,
                'desc' => $cab->description ?: $cab->type,
            ])->values(),
            'guides' => AgencyGuide::whereIn('status', ['Available', 'Assigned'])->get()->map(fn (AgencyGuide $guide) => [
                'id' => $guide->id,
                'name' => $guide->name,
                'type' => $guide->specialty,
                'rating' => (float) $guide->rating,
                'exp' => $guide->active_tours . ' active tours',
                'langs' => $guide->contact,
                'price' => 1200,
                'status' => $guide->status,
            ])->values(),
            'vehicles' => AgencyVehicle::whereIn('status', ['Idle', 'Active'])->get()->map(fn (AgencyVehicle $vehicle) => [
                'id' => $vehicle->id,
                'type' => $vehicle->type,
                'model' => $vehicle->model,
                'seats' => max(1, (int) $vehicle->current_load ?: 4),
                'fuel' => $vehicle->fuel . '% fuel',
                'price' => 1800,
                'status' => $vehicle->status,
            ])->values(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'traveler_name' => 'required|string|max:255',
            'from_location' => 'nullable|string',
            'to_destination' => 'required|string',
            'departure_date' => 'required|date|after_or_equal:today',
            'return_date' => 'required|date|after:departure_date',
            'travelers' => 'required|integer|min:1',
            'agency_package_id' => 'nullable|exists:agency_packages,id',
            'hotel_id' => 'nullable|exists:hotels,id',
            'food_package_id' => 'nullable|exists:food_packages,id',
            'cab_service_id' => 'nullable|exists:cab_services,id',
            'guide_id' => 'nullable|exists:guides,id',
            'agency_guide_id' => 'nullable|exists:agency_guides,id',
            'rental_vehicle_id' => 'nullable|exists:rental_vehicles,id',
            'agency_vehicle_id' => 'nullable|exists:agency_vehicles,id',
            'subtotal' => 'required|numeric',
            'tax' => 'required|numeric',
            'discount' => 'required|numeric',
            'total_price' => 'required|numeric',
        ]);

        $this->validatePackageDuration($validated);
        $this->validateNoOverlappingTrip($request->user()->id, $validated['departure_date'], $validated['return_date']);
        $this->validateResourceAvailability($validated);

        $trip = $this->tripService->createTrip($validated, $request->user()->id);
        $this->broadcastAgencyRefresh($trip->load(['agencyPackage', 'agencyGuide', 'agencyVehicle']));

        return response()->json(['message' => 'Trip created successfully', 'data' => $trip], 201);
    }

    public function cancel(Request $request, $tripId)
    {
        try {
            $trip = $this->tripService->cancelTrip($tripId, $request->user()->id);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        if (! $trip) {
            return response()->json(['message' => 'Trip not found'], 404);
        }

        $trip->load(['agencyPackage', 'agencyGuide', 'agencyVehicle', 'user']);

        event(new NotificationSent(
            $request->user()->id,
            "Your trip to {$trip->to_destination} has been cancelled.",
            'alert',
            ['trip_id' => $trip->id]
        ));

        Notification::createUnique(
            $request->user()->id,
            'Trip Cancelled',
            "Your trip to {$trip->to_destination} has been cancelled.",
            'alert',
            'booking'
        );

        $agencyId = $trip->agencyPackage?->agency_id
            ?? $trip->agencyGuide?->agency_id
            ?? $trip->agencyVehicle?->agency_id;
        if ($agencyId) {
            event(new NotificationSent(
                $agencyId,
                "Trip to {$trip->to_destination} by " . ($trip->traveler_name ?: ($request->user()->name)) . " has been cancelled.",
                'alert',
                ['trip_id' => $trip->id]
            ));
        }

        $this->broadcastAgencyRefresh($trip);

        return response()->json(['message' => 'Trip cancelled successfully.', 'data' => $trip]);
    }

    public function rate(Request $request, $tripId)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'rating_comment' => 'nullable|string|max:1000',
        ]);

        $trip = Trip::where('id', $tripId)
            ->where('user_id', $request->user()->id)
            ->with(['agencyPackage', 'agencyGuide', 'agencyVehicle', 'hotel'])
            ->first();

        if (! $trip) {
            return response()->json(['message' => 'Trip not found'], 404);
        }

        if ($trip->status === 'cancelled') {
            return response()->json(['message' => 'Cancelled trips cannot be rated.'], 422);
        }

        $trip->update([
            'rating' => $validated['rating'],
            'rating_comment' => $validated['rating_comment'] ?? null,
            'rated_at' => now(),
        ]);

        $this->refreshRatingAggregates($trip);
        $this->broadcastAgencyRefresh($trip->fresh(['agencyPackage', 'agencyGuide', 'agencyVehicle']));

        return response()->json([
            'message' => 'Rating submitted successfully.',
            'data' => $trip->fresh(['agencyPackage', 'hotel', 'cabService', 'foodPackage', 'agencyGuide', 'agencyVehicle']),
        ]);
    }

    private function refreshRatingAggregates(Trip $trip): void
    {
        if ($trip->hotel_id) {
            $hotelRatings = Trip::where('hotel_id', $trip->hotel_id)->whereNotNull('rating');
            Hotel::where('id', $trip->hotel_id)->update([
                'rating' => round((float) $hotelRatings->avg('rating'), 2),
                'reviews_count' => (clone $hotelRatings)->count(),
            ]);
        }

        if ($trip->agency_guide_id) {
            $avg = Trip::where('agency_guide_id', $trip->agency_guide_id)
                ->whereNotNull('rating')
                ->avg('rating');

            if ($avg !== null) {
                AgencyGuide::where('id', $trip->agency_guide_id)->update(['rating' => round((float) $avg, 2)]);
            }
        }
    }

    private function broadcastAgencyRefresh(Trip $trip): void
    {
        $agencyId = $trip->agencyPackage?->agency_id
            ?? $trip->agencyGuide?->agency_id
            ?? $trip->agencyVehicle?->agency_id;

        if ($agencyId) {
            $agencyController = app(AgencyDashboardController::class);
            $data = $agencyController->agencyDataFor($agencyId);
            event(new AgencyDataUpdated($agencyId, $data));
        }
    }

    private function validatePackageDuration(array $data): void
    {
        if (empty($data['agency_package_id'])) {
            return;
        }

        $package = AgencyPackage::find($data['agency_package_id']);
        $durationDays = $this->durationDays($package?->duration);
        if (! $durationDays) {
            return;
        }

        $departure = Carbon::parse($data['departure_date']);
        $expectedReturn = $departure->copy()->addDays($durationDays - 1)->toDateString();

        if ($data['return_date'] !== $expectedReturn) {
            throw ValidationException::withMessages([
                'return_date' => "This package is fixed at {$package->duration}. Return date must be {$expectedReturn}.",
            ]);
        }
    }

    private function validateNoOverlappingTrip(int $userId, string $departureDate, string $returnDate): void
    {
        $overlap = Trip::where('user_id', $userId)
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->whereDate('departure_date', '<=', $returnDate)
            ->whereDate('return_date', '>=', $departureDate)
            ->exists();

        if ($overlap) {
            throw ValidationException::withMessages([
                'departure_date' => 'You already have a trip booked during these dates. Please choose non-overlapping travel dates.',
            ]);
        }
    }

    private function validateResourceAvailability(array $data): void
    {
        if (! empty($data['agency_guide_id'])) {
            $busy = Trip::where('agency_guide_id', $data['agency_guide_id'])
                ->whereNotIn('status', ['cancelled', 'completed'])
                ->whereDate('departure_date', '<=', $data['return_date'])
                ->whereDate('return_date', '>=', $data['departure_date'])
                ->exists();

            if ($busy) {
                throw ValidationException::withMessages(['agency_guide_id' => 'Selected guide is already booked for these dates.']);
            }
        }

        if (! empty($data['agency_vehicle_id'])) {
            $busy = Trip::where('agency_vehicle_id', $data['agency_vehicle_id'])
                ->whereNotIn('status', ['cancelled', 'completed'])
                ->whereDate('departure_date', '<=', $data['return_date'])
                ->whereDate('return_date', '>=', $data['departure_date'])
                ->exists();

            if ($busy) {
                throw ValidationException::withMessages(['agency_vehicle_id' => 'Selected vehicle is already booked for these dates.']);
            }
        }
    }

    private function durationDays(?string $duration): ?int
    {
        if (! $duration) {
            return null;
        }

        preg_match('/(\d+)\s*day/i', $duration, $matches);

        return isset($matches[1]) ? max(1, (int) $matches[1]) : null;
    }
}
