<?php

namespace App\Http\Controllers;

use App\Events\AgencyDataUpdated;
use App\Models\AgencyGuide;
use App\Models\AgencyPackage;
use App\Models\AgencyTour;
use App\Models\AgencyVehicle;
use App\Models\Booking;
use App\Models\User;
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

    public function createPackage(Request $request)
    {
        $agency = $this->approvedAgency($request);

        $request->validate([
            'name' => 'required|string|max:255',
            'destination' => 'required|string|max:255',
            'duration' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string|url',
        ]);

        AgencyPackage::create([
            'agency_id' => $agency->id,
            'name' => $request->name,
            'destination' => $request->destination,
            'duration' => $request->duration ?: '3 Days, 2 Nights',
            'price' => $request->price,
            'status' => 'Active',
            'bookings' => 0,
            'image' => $request->image ?: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60',
        ]);

        return $this->broadcastResponse($agency, 'Package created successfully.');
    }

    public function deletePackage(Request $request, $id)
    {
        $agency = $this->approvedAgency($request);

        AgencyPackage::where('agency_id', $agency->id)->findOrFail($id)->delete();

        return $this->broadcastResponse($agency, 'Package deleted successfully.');
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

        $bookingsQuery = Booking::query();
        $activeBookings = (clone $bookingsQuery)->where('status', 'confirmed')->count();
        $monthlyRevenue = (float) (clone $bookingsQuery)
            ->where('status', 'confirmed')
            ->whereBetween('booking_date', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('total_price');
        $pendingPayouts = (float) (clone $bookingsQuery)->where('status', 'pending')->sum('total_price');
        $refunds = (float) (clone $bookingsQuery)->where('status', 'cancelled')->sum('total_price');
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

        $revenueSeries = collect(range(6, 0))
            ->map(function (int $daysAgo) use ($bookingsQuery) {
                $date = Carbon::today()->subDays($daysAgo);

                return [
                    'name' => $date->format('D'),
                    'revenue' => (float) (clone $bookingsQuery)
                        ->where('status', 'confirmed')
                        ->whereDate('booking_date', $date)
                        ->sum('total_price'),
                ];
            });

        $monthlyRevenueSeries = collect(range(5, 0))
            ->map(function (int $monthsAgo) use ($bookingsQuery) {
                $month = Carbon::today()->subMonths($monthsAgo);

                return [
                    'month' => $month->format('M'),
                    'amount' => (float) (clone $bookingsQuery)
                        ->where('status', 'confirmed')
                        ->whereYear('booking_date', $month->year)
                        ->whereMonth('booking_date', $month->month)
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
            'bookings' => $bookings,
        ];
    }
}
