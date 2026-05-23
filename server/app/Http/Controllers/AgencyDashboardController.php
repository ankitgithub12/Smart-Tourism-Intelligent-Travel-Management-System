<?php

namespace App\Http\Controllers;

use App\Models\AgencyPackage;
use App\Models\AgencyTour;
use App\Models\AgencyVehicle;
use App\Models\AgencyGuide;
use App\Models\Booking;
use App\Events\AgencyDataUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AgencyDashboardController extends Controller
{
    private function checkAgency(Request $request)
    {
        if (!in_array($request->user()?->role, ['agency', 'authority'])) {
            abort(403, 'Agency portal access required.');
        }
    }

    public function getDashboard(Request $request)
    {
        $this->checkAgency($request);

        return response()->json($this->gatherAgencyData());
    }

    public function createPackage(Request $request)
    {
        $this->checkAgency($request);

        $request->validate([
            'name' => 'required|string|max:255',
            'destination' => 'required|string|max:255',
            'duration' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string|url',
        ]);

        $pkg = AgencyPackage::create([
            'name' => $request->name,
            'destination' => $request->destination,
            'duration' => $request->duration ?: '3 Days, 2 Nights',
            'price' => $request->price,
            'status' => 'Active',
            'bookings' => 0,
            'image' => $request->image ?: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60',
        ]);

        $agencyData = $this->gatherAgencyData();
        event(new AgencyDataUpdated($agencyData));

        return response()->json([
            'message' => 'Package created successfully.',
            'agency' => $agencyData,
        ]);
    }

    public function deletePackage(Request $request, $id)
    {
        $this->checkAgency($request);

        $pkg = AgencyPackage::findOrFail($id);
        $pkg->delete();

        $agencyData = $this->gatherAgencyData();
        event(new AgencyDataUpdated($agencyData));

        return response()->json([
            'message' => 'Package deleted successfully.',
            'agency' => $agencyData,
        ]);
    }

    public function createTour(Request $request)
    {
        $this->checkAgency($request);

        $request->validate([
            'package_name' => 'required|string',
            'date' => 'required|date',
            'time' => 'required|string',
            'guide_name' => 'required|string',
            'capacity' => 'required|integer|min:1',
        ]);

        $tour = AgencyTour::create([
            'id' => 'T-' . rand(104, 999),
            'package_name' => $request->package_name,
            'date' => $request->date,
            'time' => $request->time,
            'guide_name' => $request->guide_name,
            'status' => 'Upcoming',
            'capacity' => $request->capacity,
            'filled' => 0,
        ]);

        $agencyData = $this->gatherAgencyData();
        event(new AgencyDataUpdated($agencyData));

        return response()->json([
            'message' => 'Tour scheduled successfully.',
            'agency' => $agencyData,
        ]);
    }

    public function createVehicle(Request $request)
    {
        $this->checkAgency($request);

        $request->validate([
            'model' => 'required|string',
            'type' => 'required|string',
            'driver' => 'required|string',
            'location' => 'required|string',
        ]);

        $vehicle = AgencyVehicle::create([
            'id' => 'V-' . str_pad(rand(5, 999), 3, '0', STR_PAD_LEFT),
            'model' => $request->model,
            'type' => $request->type,
            'driver' => $request->driver,
            'current_load' => 0,
            'status' => 'Idle',
            'fuel' => 100,
            'location' => $request->location,
        ]);

        $agencyData = $this->gatherAgencyData();
        event(new AgencyDataUpdated($agencyData));

        return response()->json([
            'message' => 'Vehicle added successfully.',
            'agency' => $agencyData,
        ]);
    }

    public function createGuide(Request $request)
    {
        $this->checkAgency($request);

        $request->validate([
            'name' => 'required|string',
            'specialty' => 'required|string',
            'contact' => 'required|string',
        ]);

        $guide = AgencyGuide::create([
            'id' => 'G-' . rand(205, 999),
            'name' => $request->name,
            'specialty' => $request->specialty,
            'rating' => 5.00,
            'status' => 'Available',
            'active_tours' => 0,
            'contact' => $request->contact,
        ]);

        $agencyData = $this->gatherAgencyData();
        event(new AgencyDataUpdated($agencyData));

        return response()->json([
            'message' => 'Guide registered successfully.',
            'agency' => $agencyData,
        ]);
    }

    private function gatherAgencyData()
    {
        // DB stats
        $totalBookingsCount = Booking::count();
        $totalRevenueSum = Booking::where('status', 'confirmed')->sum('total_price');
        $totalPlacesCount = DB::table('tourist_places')->count();
        $avgRatingVal = number_format(DB::table('reviews')->avg('rating') ?: 4.8, 1);

        $stats = [
            ['label' => 'Active Bookings', 'value' => $totalBookingsCount ?: 45, 'icon' => 'Users', 'color' => 'text-sky-500', 'bg' => 'bg-sky-500/10'],
            ['label' => 'Revenue (Month)', 'value' => '₹' . number_format(($totalRevenueSum ?: 240000) / 100000, 1) . 'L', 'icon' => 'DollarSign', 'color' => 'text-teal-500', 'bg' => 'bg-teal-500/10'],
            ['label' => 'Listed Properties', 'value' => $totalPlacesCount ?: 12, 'icon' => 'Building2', 'color' => 'text-indigo-500', 'bg' => 'bg-indigo-500/10'],
            ['label' => 'Average Rating', 'value' => $avgRatingVal, 'icon' => 'Star', 'color' => 'text-amber-500', 'bg' => 'bg-amber-500/10'],
        ];

        $packages = AgencyPackage::all();
        $tours = AgencyTour::all();
        $vehicles = AgencyVehicle::all();
        $guides = AgencyGuide::all();

        // Join actual bookings with tourist place names and users
        $bookingsList = Booking::orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $bookings = [];
        foreach ($bookingsList as $b) {
            $user = DB::table('users')->where('id', $b->user_id)->first();
            $place = DB::table('tourist_places')->where('id', $b->tourist_place_id)->first();
            $bookings[] = [
                'id' => 'B-' . $b->id,
                'customer' => $user ? $user->name : 'Guest User',
                'listing' => $place ? $place->name : 'Custom Trip Tour',
                'dates' => $b->start_date . ' - ' . $b->end_date,
                'amount' => (float)$b->total_price,
                'status' => ucfirst($b->status),
                'time' => $b->created_at->diffForHumans(),
            ];
        }

        if (empty($bookings)) {
            $bookings = [
                ['id' => 'B-8901', 'customer' => 'Rahul Sharma', 'listing' => 'Ocean Breeze Escape', 'dates' => '25 May - 28 May', 'amount' => 25000, 'status' => 'Confirmed', 'time' => '5 mins ago'],
                ['id' => 'B-8902', 'customer' => 'Priya Patel', 'listing' => 'Cab Service (V-001)', 'dates' => '24 May', 'amount' => 3500, 'status' => 'Pending', 'time' => '15 mins ago'],
            ];
        }

        return [
            'stats' => $stats,
            'packages' => $packages,
            'tours' => $tours,
            'vehicles' => $vehicles,
            'guides' => $guides,
            'bookings' => $bookings,
        ];
    }
}
