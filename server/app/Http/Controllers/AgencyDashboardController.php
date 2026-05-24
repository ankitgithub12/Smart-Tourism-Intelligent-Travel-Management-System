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
        ]);

        $imageUrl = $request->input('image');
        if ($request->hasFile('image_file')) {
            $upload = $cloudinary->upload($request->file('image_file'), 'smart-tourism/packages');
            abort_if(! $upload, 422, 'Image upload failed. Please check Cloudinary configuration.');
            $imageUrl = $upload['url'];
        }

        AgencyPackage::create([
            'agency_id' => $agency->id,
            'name' => $request->name,
            'destination' => $request->destination,
            'duration' => $request->duration ?: '3 Days, 2 Nights',
            'price' => $request->price,
            'status' => 'Active',
            'bookings' => 0,
            'image' => $imageUrl ?: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60',
        ]);

        return $this->broadcastResponse($agency, 'Package created successfully.');
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
        ]);

        return $this->broadcastResponse($agency, 'Hotel created successfully.');
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

        AgencyPackage::where('agency_id', $agency->id)->findOrFail($id)->delete();

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

        $bookingId = Str::startsWith($id, 'B-') ? Str::after($id, 'B-') : $id;
        $booking = Booking::findOrFail($bookingId);
        $status = strtolower($validated['status']);
        $updates = ['status' => $status];

        if ($status === 'cancelled') {
            $updates['cancelled_at'] = now();
        }

        $booking->update($updates);

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

    private function gatherAgencyData(User $agency): array
    {
        $packages = AgencyPackage::where('agency_id', $agency->id)->latest()->get();
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
            ])->values(),
            'guides' => $guides->map(fn (AgencyGuide $guide) => [
                'id' => $guide->id,
                'name' => $guide->name,
                'specialty' => $guide->specialty,
                'rating' => (float) $guide->rating,
                'status' => $guide->status,
                'activeTours' => $guide->active_tours,
                'contact' => $guide->contact,
            ])->values(),
            'bookings' => $tripBookings->concat($bookings)->take(10)->values(),
        ];
    }

    public function agencyDataFor(int $agencyId): array
    {
        return $this->gatherAgencyData(User::findOrFail($agencyId));
    }
}
