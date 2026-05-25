<?php

namespace App\Http\Controllers;

use App\Events\AgencyDataUpdated;
use App\Models\AgencyGuide;
use App\Models\AgencyPackage;
use App\Models\AgencyTour;
use App\Models\AgencyVehicle;
use App\Models\Booking;
use App\Models\ContactMessage;
use App\Models\Hotel;
use App\Models\Trip;
use App\Models\User;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class AgencyDashboardController extends Controller
{
    public function getDashboard(Request $request)
    {
        $agency = $this->approvedAgency($request);

        return response()->json($this->gatherAgencyData($agency));
    }

    public function createPackage(Request $request, CloudinaryService $cloudinary)
    {
        $agency = $this->approvedAgency($request);

        $request->validate([
            'name' => 'required|string|max:255',
            'destination' => 'required|string|max:255',
            'duration' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|url',
            'image_file' => 'nullable|image|max:5120',
            'itinerary' => 'nullable|string',
        ]);

        $imageUrl = $request->input('image');
        if ($request->hasFile('image_file')) {
            $upload = $cloudinary->upload($request->file('image_file'), 'smart-tourism/packages');
            abort_if(! $upload, 422, 'Image upload failed. Please check Cloudinary configuration.');
            $imageUrl = $upload['url'];
        }

        $pkg = AgencyPackage::create([
            'agency_id' => $agency->id,
            'name' => $request->name,
            'destination' => $request->destination,
            'duration' => $request->duration ?: '3 Days, 2 Nights',
            'price' => $request->price,
            'status' => 'Active',
            'bookings' => 0,
            'image' => $imageUrl ?: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60',
            'itinerary' => $request->itinerary,
        ]);

        $mapped = [
            'id' => $pkg->id,
            'name' => $pkg->name,
            'destination' => $pkg->destination,
            'duration' => $pkg->duration,
            'price' => (float) $pkg->price,
            'rating' => 0.0,
            'reviews' => 0,
            'image' => $pkg->image,
            'itinerary' => $pkg->itinerary,
            'includes' => ['Hotel', 'Meals', 'Transport', 'Guide'],
            'category' => $this->categoryFor($pkg->destination),
            'status' => $pkg->status,
        ];
        event(new \App\Events\PackageUpdated('create', $mapped));

        return $this->broadcastResponse($agency, 'Package created successfully.');
    }

    public function updatePackage(Request $request, CloudinaryService $cloudinary, $id)
    {
        $agency = $this->approvedAgency($request);

        $request->validate([
            'name' => 'required|string|max:255',
            'destination' => 'required|string|max:255',
            'duration' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|url',
            'image_file' => 'nullable|image|max:5120',
            'itinerary' => 'nullable|string',
            'status' => 'nullable|string|in:Active,Inactive',
        ]);

        $package = AgencyPackage::where('agency_id', $agency->id)->findOrFail($id);

        $imageUrl = $request->input('image', $package->image);
        if ($request->hasFile('image_file')) {
            $upload = $cloudinary->upload($request->file('image_file'), 'smart-tourism/packages');
            abort_if(! $upload, 422, 'Image upload failed. Please check Cloudinary configuration.');
            $imageUrl = $upload['url'];
        }

        $package->update([
            'name' => $request->name,
            'destination' => $request->destination,
            'duration' => $request->duration ?: '3 Days, 2 Nights',
            'price' => $request->price,
            'itinerary' => $request->itinerary,
            'image' => $imageUrl,
            'status' => $request->input('status', $package->status),
        ]);

        $ratingInfo = Trip::query()
            ->where('agency_package_id', $package->id)
            ->whereNotNull('rating')
            ->selectRaw('ROUND(AVG(rating), 2) as average_rating, COUNT(*) as reviews_count')
            ->first();

        $mapped = [
            'id' => $package->id,
            'name' => $package->name,
            'destination' => $package->destination,
            'duration' => $package->duration,
            'price' => (float) $package->price,
            'rating' => $ratingInfo && $ratingInfo->average_rating ? (float) $ratingInfo->average_rating : 0.0,
            'reviews' => $ratingInfo ? (int) $ratingInfo->reviews_count : 0,
            'image' => $package->image,
            'itinerary' => $package->itinerary,
            'includes' => ['Hotel', 'Meals', 'Transport', 'Guide'],
            'category' => $this->categoryFor($package->destination),
            'status' => $package->status,
        ];
        event(new \App\Events\PackageUpdated('update', $mapped));

        // Notify all tourists who have active bookings/trips with this package
        $trips = Trip::where('agency_package_id', $package->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->get();

        foreach ($trips as $trip) {
            \App\Models\Notification::createUnique(
                $trip->user_id,
                'Package Updated',
                "The travel package '{$package->name}' for your upcoming trip to {$trip->to_destination} has been updated by the agency.",
                'info',
                'booking'
            );
        }

        return $this->broadcastResponse($agency, 'Package updated successfully.');
    }

    public function updatePackageStatus(Request $request, $id)
    {
        $agency = $this->approvedAgency($request);
        $request->validate([
            'status' => 'required|string|in:Active,Inactive',
        ]);

        $package = AgencyPackage::where('agency_id', $agency->id)->findOrFail($id);
        $package->update([
            'status' => $request->status,
        ]);

        $ratingInfo = Trip::query()
            ->where('agency_package_id', $package->id)
            ->whereNotNull('rating')
            ->selectRaw('ROUND(AVG(rating), 2) as average_rating, COUNT(*) as reviews_count')
            ->first();

        $mapped = [
            'id' => $package->id,
            'name' => $package->name,
            'destination' => $package->destination,
            'duration' => $package->duration,
            'price' => (float) $package->price,
            'rating' => $ratingInfo && $ratingInfo->average_rating ? (float) $ratingInfo->average_rating : 0.0,
            'reviews' => $ratingInfo ? (int) $ratingInfo->reviews_count : 0,
            'image' => $package->image,
            'itinerary' => $package->itinerary,
            'includes' => ['Hotel', 'Meals', 'Transport', 'Guide'],
            'category' => $this->categoryFor($package->destination),
            'status' => $package->status,
        ];
        event(new \App\Events\PackageUpdated('update', $mapped));

        return $this->broadcastResponse($agency, 'Package status updated successfully.');
    }

    public function createHotel(Request $request, CloudinaryService $cloudinary)
    {
        $agency = $this->approvedAgency($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'stars' => 'required|integer|min:1|max:5',
            'price_per_night' => 'required|numeric|min:0',
            'image' => 'nullable|url',
            'image_file' => 'nullable|image|max:5120',
            'amenities' => 'nullable',
        ]);

        $amenities = $request->input('amenities', []);
        if (is_string($amenities)) {
            $amenities = array_values(array_filter(array_map('trim', explode(',', $amenities))));
        }

        $imageUrl = $request->input('image');
        if ($request->hasFile('image_file')) {
            $upload = $cloudinary->upload($request->file('image_file'), 'smart-tourism/hotels');
            abort_if(! $upload, 422, 'Image upload failed. Please check Cloudinary configuration.');
            $imageUrl = $upload['url'];
        }

        Hotel::create([
            'agency_id' => $agency->id,
            'name' => $validated['name'],
            'location' => $validated['location'],
            'stars' => $validated['stars'],
            'price_per_night' => $validated['price_per_night'],
            'rating' => 0,
            'reviews_count' => 0,
            'image' => $imageUrl ?: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format',
            'amenities' => $amenities,
            'status' => 'Active',
        ]);

        return $this->broadcastResponse($agency, 'Hotel created successfully.');
    }

    public function updateHotel(Request $request, CloudinaryService $cloudinary, $id)
    {
        $agency = $this->approvedAgency($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'stars' => 'required|integer|min:1|max:5',
            'price_per_night' => 'required|numeric|min:0',
            'image' => 'nullable|url',
            'image_file' => 'nullable|image|max:5120',
            'amenities' => 'nullable',
            'status' => 'nullable|string|in:Active,Inactive',
        ]);

        $hotel = Hotel::where('agency_id', $agency->id)->findOrFail($id);

        $amenities = $request->input('amenities', $hotel->amenities);
        if (is_string($amenities)) {
            $amenities = array_values(array_filter(array_map('trim', explode(',', $amenities))));
        }

        $imageUrl = $request->input('image', $hotel->image);
        if ($request->hasFile('image_file')) {
            $upload = $cloudinary->upload($request->file('image_file'), 'smart-tourism/hotels');
            abort_if(! $upload, 422, 'Image upload failed. Please check Cloudinary configuration.');
            $imageUrl = $upload['url'];
        }

        $hotel->update([
            'name' => $validated['name'],
            'location' => $validated['location'],
            'stars' => $validated['stars'],
            'price_per_night' => $validated['price_per_night'],
            'amenities' => $amenities,
            'image' => $imageUrl,
            'status' => $request->input('status', $hotel->status),
        ]);

        return $this->broadcastResponse($agency, 'Hotel updated successfully.');
    }

    public function updateHotelStatus(Request $request, $id)
    {
        $agency = $this->approvedAgency($request);
        $request->validate([
            'status' => 'required|string|in:Active,Inactive',
        ]);

        $hotel = Hotel::where('agency_id', $agency->id)->findOrFail($id);
        $hotel->update([
            'status' => $request->status,
        ]);

        return $this->broadcastResponse($agency, 'Hotel status updated successfully.');
    }

    public function deleteHotel(Request $request, $id)
    {
        $agency = $this->approvedAgency($request);

        Hotel::where('agency_id', $agency->id)->findOrFail($id)->delete();

        return $this->broadcastResponse($agency, 'Hotel deleted successfully.');
    }

    public function deletePackage(Request $request, $id)
    {
        $agency = $this->approvedAgency($request);

        $package = AgencyPackage::where('agency_id', $agency->id)->findOrFail($id);
        $packageId = $package->id;
        $package->delete();

        event(new \App\Events\PackageUpdated('delete', ['id' => $packageId]));

        return $this->broadcastResponse($agency, 'Package deleted successfully.');
    }

    public function deleteVehicle(Request $request, $id)
    {
        $agency = $this->approvedAgency($request);

        AgencyVehicle::where('agency_id', $agency->id)->findOrFail($id)->delete();

        return $this->broadcastResponse($agency, 'Vehicle deleted successfully.');
    }

    public function deleteGuide(Request $request, $id)
    {
        $agency = $this->approvedAgency($request);

        AgencyGuide::where('agency_id', $agency->id)->findOrFail($id)->delete();

        return $this->broadcastResponse($agency, 'Guide deleted successfully.');
    }

    public function createTour(Request $request)
    {
        $agency = $this->approvedAgency($request);

        $request->validate([
            'package_name' => 'required|string|max:255',
            'date' => 'required|date',
            'time' => 'required|string|max:30',
            'guide_name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
        ]);

        AgencyTour::create([
            'id' => 'T-' . strtoupper(Str::random(8)),
            'agency_id' => $agency->id,
            'package_name' => $request->package_name,
            'date' => $request->date,
            'time' => $request->time,
            'guide_name' => $request->guide_name,
            'status' => 'Upcoming',
            'capacity' => $request->capacity,
            'filled' => 0,
        ]);

        return $this->broadcastResponse($agency, 'Tour scheduled successfully.');
    }

    public function createVehicle(Request $request)
    {
        $agency = $this->approvedAgency($request);

        $request->validate([
            'model' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'driver' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'price_per_day' => 'nullable|numeric|min:0',
        ]);

        AgencyVehicle::create([
            'id' => 'V-' . strtoupper(Str::random(8)),
            'agency_id' => $agency->id,
            'model' => $request->model,
            'type' => $request->type,
            'driver' => $request->driver,
            'current_load' => 0,
            'status' => 'Idle',
            'fuel' => 100,
            'location' => $request->location,
            'price_per_day' => $request->price_per_day ?: 1800.00,
        ]);

        return $this->broadcastResponse($agency, 'Vehicle added successfully.');
    }

    public function updateVehicleStatus(Request $request, string $id)
    {
        $agency = $this->approvedAgency($request);
        $validated = $request->validate([
            'status' => 'required|string|in:Active,Idle,Maintenance',
        ]);

        $vehicle = AgencyVehicle::where('agency_id', $agency->id)->findOrFail($id);
        $vehicle->update([
            'status' => $validated['status'],
            'current_load' => $validated['status'] === 'Active' ? max(1, $vehicle->current_load) : 0,
        ]);

        return $this->broadcastResponse($agency, 'Vehicle status updated successfully.');
    }

    public function createGuide(Request $request)
    {
        $agency = $this->approvedAgency($request);

        $request->validate([
            'name' => 'required|string|max:255',
            'specialty' => 'required|string|max:255',
            'contact' => 'required|string|max:100',
            'price_per_day' => 'nullable|numeric|min:0',
        ]);

        AgencyGuide::create([
            'id' => 'G-' . strtoupper(Str::random(8)),
            'agency_id' => $agency->id,
            'name' => $request->name,
            'specialty' => $request->specialty,
            'rating' => 5.00,
            'status' => 'Available',
            'active_tours' => 0,
            'contact' => $request->contact,
            'price_per_day' => $request->price_per_day ?: 1200.00,
        ]);

        return $this->broadcastResponse($agency, 'Guide registered successfully.');
    }

    public function updateGuideStatus(Request $request, string $id)
    {
        $agency = $this->approvedAgency($request);
        $validated = $request->validate([
            'status' => 'required|string|in:Available,Unavailable,Assigned',
        ]);

        AgencyGuide::where('agency_id', $agency->id)
            ->findOrFail($id)
            ->update(['status' => $validated['status']]);

        return $this->broadcastResponse($agency, 'Guide availability updated successfully.');
    }

    public function updateBookingStatus(Request $request, string $id)
    {
        $agency = $this->approvedAgency($request);
        $validated = $request->validate([
            'status' => 'required|string|in:Confirmed,Cancelled',
        ]);

        $status = strtolower($validated['status']);
        $updates = ['status' => $status];

        if ($status === 'cancelled') {
            $updates['cancelled_at'] = now();
        }

        if (Str::startsWith($id, 'T-')) {
            $tripId = Str::after($id, 'T-');
            $trip = Trip::findOrFail($tripId);
            $trip->update($updates);

            if ($status === 'confirmed' && $trip->agency_package_id) {
                AgencyPackage::where('id', $trip->agency_package_id)->increment('bookings');
            } elseif ($status === 'cancelled' && $trip->agency_package_id) {
                AgencyPackage::where('id', $trip->agency_package_id)->where('bookings', '>', 0)->decrement('bookings');
            }

            // Release guide and vehicle if cancelled
            if ($status === 'cancelled') {
                if ($trip->agency_guide_id) {
                    $guide = AgencyGuide::find($trip->agency_guide_id);
                    $guide?->update([
                        'status' => 'Available',
                        'active_tours' => max(0, (int) $guide->active_tours - 1),
                    ]);
                }

                if ($trip->agency_vehicle_id) {
                    AgencyVehicle::where('id', $trip->agency_vehicle_id)->update([
                        'status' => 'Idle',
                        'current_load' => 0,
                    ]);
                }
            }

            $this->broadcastAgencyRefresh($trip);
        } else {
            $bookingId = Str::startsWith($id, 'B-') ? Str::after($id, 'B-') : $id;
            $booking = Booking::findOrFail($bookingId);
            $booking->update($updates);
        }

        return $this->broadcastResponse($agency, 'Booking status updated successfully.');
    }

    private function approvedAgency(Request $request): User
    {
        $agency = $request->user();

        if (! $agency || $agency->role !== 'agency') {
            abort(403, 'Agency portal access required.');
        }

        if ($agency->approval_status !== 'approved' || $agency->deactivated_at) {
            abort(403, 'Your travel agency account requires City Authority approval.');
        }

        return $agency;
    }

    private function broadcastResponse(User $agency, string $message)
    {
        $agencyData = $this->gatherAgencyData($agency);
        event(new AgencyDataUpdated($agency->id, $agencyData));

        return response()->json([
            'message' => $message,
            'agency' => $agencyData,
        ]);
    }

    private function broadcastAgencyRefresh(Trip $trip): void
    {
        $agencyId = $trip->agencyPackage?->agency_id
            ?? $trip->agencyGuide?->agency_id
            ?? $trip->agencyVehicle?->agency_id;

        if ($agencyId) {
            $data = $this->gatherAgencyData(User::findOrFail($agencyId));
            event(new AgencyDataUpdated($agencyId, $data));
        }
    }

    private function gatherAgencyData(User $agency): array
    {
        // Dynamically recalculate each package's bookings count to ensure 100% correct counts
        $packages = AgencyPackage::where('agency_id', $agency->id)->latest()->get()->map(function ($pkg) {
            $count = Trip::where('agency_package_id', $pkg->id)
                ->whereIn('status', ['confirmed', 'completed'])
                ->count();
            if ($pkg->bookings !== $count) {
                $pkg->bookings = $count;
                $pkg->save();
            }
            return $pkg;
        });

        $tours = AgencyTour::where('agency_id', $agency->id)->latest()->get();
        $vehicles = AgencyVehicle::where('agency_id', $agency->id)->latest()->get();
        $guides = AgencyGuide::where('agency_id', $agency->id)->latest()->get();
        $hotels = Hotel::where('agency_id', $agency->id)->latest()->get();
        $messages = ContactMessage::where('recipient_role', 'agency')->latest()->limit(20)->get();

        $agencyTripQuery = Trip::with(['user', 'agencyPackage'])
            ->where(function ($query) use ($agency) {
                $query->whereHas('agencyPackage', fn ($q) => $q->where('agency_id', $agency->id))
                    ->orWhereHas('agencyGuide', fn ($q) => $q->where('agency_id', $agency->id))
                    ->orWhereHas('agencyVehicle', fn ($q) => $q->where('agency_id', $agency->id));
            });
        $activeBookings = (clone $agencyTripQuery)->where('status', 'confirmed')->count();
        $monthlyRevenue = (float) (clone $agencyTripQuery)
            ->where('status', 'confirmed')
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('total_price');
        $pendingPayouts = (float) (clone $agencyTripQuery)->where('status', 'pending')->sum('total_price');
        $refunds = (float) (clone $agencyTripQuery)->where('status', 'cancelled')->sum('total_price');
        $averageRating = $guides->avg('rating') ?? 0;

        $bookings = Booking::with(['user', 'place'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (Booking $booking) => [
                'id' => 'B-' . $booking->id,
                'customer' => $booking->user?->name ?? 'Guest User',
                'listing' => $booking->place?->name ?? 'Custom Trip Tour',
                'dates' => Carbon::parse($booking->booking_date)->format('d M Y'),
                'amount' => (float) $booking->total_price,
                'status' => ucfirst($booking->status),
                'time' => $booking->created_at?->diffForHumans() ?? '',
            ])
            ->values();

        $tripBookings = (clone $agencyTripQuery)
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (Trip $trip) => [
                'id' => 'T-' . $trip->id,
                'customer' => $trip->traveler_name ?: ($trip->user?->name ?? 'Guest User'),
                'listing' => $trip->agencyPackage?->name ?? $trip->to_destination,
                'dates' => $trip->departure_date?->format('d M Y') . ' - ' . $trip->return_date?->format('d M Y'),
                'amount' => (float) $trip->total_price,
                'status' => ucfirst($trip->status),
                'time' => $trip->created_at?->diffForHumans() ?? '',
            ])
            ->values();

        $revenueSeries = collect(range(6, 0))
            ->map(function (int $daysAgo) use ($agencyTripQuery) {
                $date = Carbon::today()->subDays($daysAgo);

                return [
                    'name' => $date->format('D'),
                    'revenue' => (float) (clone $agencyTripQuery)
                        ->where('status', 'confirmed')
                        ->whereDate('created_at', $date)
                        ->sum('total_price'),
                ];
            });

        $monthlyRevenueSeries = collect(range(5, 0))
            ->map(function (int $monthsAgo) use ($agencyTripQuery) {
                $month = Carbon::today()->subMonths($monthsAgo);

                return [
                    'month' => $month->format('M'),
                    'amount' => (float) (clone $agencyTripQuery)
                        ->where('status', 'confirmed')
                        ->whereYear('created_at', $month->year)
                        ->whereMonth('created_at', $month->month)
                        ->sum('total_price'),
                ];
            });

        // Compute advanced analytics for package sales
        $agencyTripConfirmedQuery = (clone $agencyTripQuery)->whereIn('status', ['confirmed', 'completed']);
        $totalSales = $agencyTripConfirmedQuery->count();
        $totalRevenue = (float) $agencyTripConfirmedQuery->sum('total_price');
        $bookingCounts = (clone $agencyTripQuery)->count();

        $popularPackage = AgencyPackage::where('agency_id', $agency->id)->orderBy('bookings', 'desc')->first();
        $popularPackageName = $popularPackage ? $popularPackage->name : 'N/A';
        $popularPackageBookings = $popularPackage ? $popularPackage->bookings : 0;

        $statusCounts = (clone $agencyTripQuery)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $confirmedCount = ($statusCounts['confirmed'] ?? 0);
        $pendingCount = ($statusCounts['pending'] ?? 0);
        $cancelledCount = ($statusCounts['cancelled'] ?? 0) + ($statusCounts['canceled'] ?? 0);

        $analytics = [
            'totalSales' => $totalSales,
            'totalRevenue' => $totalRevenue,
            'totalBookings' => $bookingCounts,
            'popularPackage' => [
                'name' => $popularPackageName,
                'bookings' => $popularPackageBookings
            ],
            'statusDistribution' => [
                'Confirmed' => $confirmedCount,
                'Pending' => $pendingCount,
                'Cancelled' => $cancelledCount
            ]
        ];

        return [
            'stats' => [
                ['label' => 'Active Bookings', 'value' => $activeBookings],
                ['label' => 'Revenue (Month)', 'value' => 'INR ' . number_format($monthlyRevenue)],
                ['label' => 'Listed Packages', 'value' => $packages->count()],
                ['label' => 'Average Rating', 'value' => number_format($averageRating, 1)],
            ],
            'financials' => [
                'monthlyRevenue' => $monthlyRevenue,
                'pendingPayouts' => $pendingPayouts,
                'refunds' => $refunds,
            ],
            'revenueSeries' => $revenueSeries,
            'monthlyRevenueSeries' => $monthlyRevenueSeries,
            'packages' => $packages,
            'hotels' => $hotels->map(fn (Hotel $hotel) => [
                'id' => $hotel->id,
                'name' => $hotel->name,
                'location' => $hotel->location,
                'stars' => (int) $hotel->stars,
                'price' => (float) $hotel->price_per_night,
                'rating' => (float) $hotel->rating,
                'reviews' => (int) $hotel->reviews_count,
                'image' => $hotel->image,
                'amenities' => $hotel->amenities ?: [],
                'status' => $hotel->status ?: 'Active',
            ])->values(),
            'messages' => $messages->map(fn (ContactMessage $message) => [
                'id' => $message->id,
                'name' => $message->name,
                'email' => $message->email,
                'subject' => $message->subject,
                'message' => $message->message,
                'senderRole' => $message->sender_role,
                'time' => $message->created_at?->diffForHumans() ?? '',
            ])->values(),
            'tours' => $tours->map(fn (AgencyTour $tour) => [
                'id' => $tour->id,
                'package' => $tour->package_name,
                'date' => $tour->date->format('Y-m-d'),
                'time' => $tour->time,
                'guide' => $tour->guide_name,
                'status' => $tour->status,
                'capacity' => $tour->capacity,
                'filled' => $tour->filled,
            ])->values(),
            'vehicles' => $vehicles->map(fn (AgencyVehicle $vehicle) => [
                'id' => $vehicle->id,
                'model' => $vehicle->model,
                'type' => $vehicle->type,
                'driver' => $vehicle->driver,
                'currentLoad' => $vehicle->current_load,
                'status' => $vehicle->status,
                'fuel' => $vehicle->fuel,
                'location' => $vehicle->location,
                'price' => (float) ($vehicle->price_per_day ?: 1800.00),
            ])->values(),
            'guides' => $guides->map(fn (AgencyGuide $guide) => [
                'id' => $guide->id,
                'name' => $guide->name,
                'specialty' => $guide->specialty,
                'rating' => (float) $guide->rating,
                'status' => $guide->status,
                'activeTours' => $guide->active_tours,
                'contact' => $guide->contact,
                'price' => (float) ($guide->price_per_day ?: 1200.00),
            ])->values(),
            'bookings' => $tripBookings->take(10)->values(),
            'analytics' => $analytics,
        ];
    }

    public function agencyDataFor(int $agencyId): array
    {
        return $this->gatherAgencyData(User::findOrFail($agencyId));
    }

    private function categoryFor(string $destination): string
    {
        $value = strtolower($destination);

        return match (true) {
            str_contains($value, 'beach') || str_contains($value, 'goa') || str_contains($value, 'andaman') => 'beach',
            str_contains($value, 'mount') || str_contains($value, 'manali') || str_contains($value, 'himalaya') => 'adventure',
            str_contains($value, 'fort') || str_contains($value, 'jaipur') || str_contains($value, 'rajasthan') => 'heritage',
            str_contains($value, 'kerala') || str_contains($value, 'backwater') => 'nature',
            default => 'city',
        };
    }
}
