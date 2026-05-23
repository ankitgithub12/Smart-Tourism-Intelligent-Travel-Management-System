<?php

namespace App\Http\Controllers;

use App\Models\CrowdZone;
use App\Models\TrafficPoint;
use App\Models\Emergency;
use App\Models\WasteBin;
use App\Models\SustainabilityMetric;
use App\Models\User;
use App\Events\TelemetryUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TelemetryController extends Controller
{
    private function checkAuthority(Request $request)
    {
        if ($request->user()?->role !== 'authority') {
            abort(403, 'Authority command center access required.');
        }
    }

    public function getTelemetry(Request $request)
    {
        $this->checkAuthority($request);

        return response()->json($this->gatherTelemetryData());
    }

    public function updateEmergencyStatus(Request $request, $id)
    {
        $this->checkAuthority($request);

        $request->validate([
            'status' => 'required|string',
        ]);

        $emergency = Emergency::findOrFail($id);
        $emergency->update([
            'status' => $request->status,
        ]);

        $telemetry = $this->gatherTelemetryData();
        event(new TelemetryUpdated($telemetry));

        return response()->json([
            'message' => 'Incident status updated successfully.',
            'telemetry' => $telemetry,
        ]);
    }

    public function updateAgencyApproval(Request $request, $id)
    {
        $this->checkAuthority($request);

        $request->validate([
            'status' => 'required|string|in:Approved,Rejected,Pending',
        ]);

        // In this implementation, we map approved/rejected statuses.
        // For compliance, we can store it in a database table or just update a custom status in memory/cache/column.
        // Wait, since we need to seed and show agencies, let's see how they are listed.
        // The mock had Rajasthan Travel Agency, Pristine Beach, Peak Adventure, etc.
        // Let's store mock agencies state in the database using a table or DB settings, or just let users have their approval status tracked.
        // Wait, Rajasthan Travel Agency is seeded in `users` table with email `agency@rajasthan.travel` and name 'Rajasthan Travel Agency'.
        // Let's see: `UsersSeeder` seeds the role `agency`.
        // Let's make it so we retrieve agencies by reading the `users` table where `role = 'agency'`.
        // For users table, we can retrieve:
        // - `id` (e.g. user ID)
        // - `name` (e.g. Rajasthan Travel Agency)
        // - `owner` (name or sub-field)
        // - `license` (email or custom field)
        // - `status` (active or deactivated_at status)
        // Or to keep it perfectly aligned with `agencies` dashboard structure, we can return the mock array but with the actual DB-driven users merged in!
        // Yes, let's load all users with role `agency` and map them!
        // To make it simple, let's do:
        // Rajasthan Travel Agency (id: 'AG-901', name: Rajasthan Travel Agency, owner: 'Vikram Joshi', license: 'L-Goa-44129', status: 'Pending', rating: 0, date: 'May 20, 2026')
        // Wait, we can fetch all users with role 'agency' and list them! Let's return dynamic database users as agencies.
        // To persist the approved/rejected status, we can use `deactivated_at`.
        // - If `deactivated_at` is null, it's "Approved"
        // - If `deactivated_at` is set, it's "Rejected" or "Deactivated"
        // - Or we can store an in-memory/cache map, or just update the user!
        // Let's do this: if status is Approved, we set `deactivated_at = null`. If Rejected, we deactivate the user!
        // That is elegant and matches Laravel's existing UserController!

        $user = User::findOrFail($id);
        if ($request->status === 'Approved') {
            $user->update(['deactivated_at' => null]);
        } else if ($request->status === 'Rejected') {
            $user->update(['deactivated_at' => now()]);
        }

        $telemetry = $this->gatherTelemetryData();
        event(new TelemetryUpdated($telemetry));

        return response()->json([
            'message' => 'Agency compliance status updated successfully.',
            'telemetry' => $telemetry,
        ]);
    }

    public function tickTelemetry(Request $request)
    {
        // Periodic background telemetry tick simulator
        // Updates densities, speeds, waste levels, and broadcasts via Reverb.

        // 1. Update crowd zones
        $zones = CrowdZone::all();
        foreach ($zones as $zone) {
            $delta = rand(-5, 5);
            $newDensity = max(10, min(100, $zone->density + $delta));
            $status = 'Low';
            if ($newDensity >= 75) $status = 'Critical';
            elseif ($newDensity >= 55) $status = 'High';
            elseif ($newDensity >= 30) $status = 'Moderate';

            $zone->update([
                'density' => $newDensity,
                'visitors' => max(50, $zone->visitors + $delta * 15),
                'status' => $status,
            ]);
        }

        // 2. Update traffic points
        $traffic = TrafficPoint::all();
        foreach ($traffic as $point) {
            $deltaSpeed = rand(-7, 7);
            $newSpeed = max(5, min(90, $point->speed + $deltaSpeed));
            $congestion = 'Low';
            $status = 'Clear';
            if ($newSpeed < 20) {
                $congestion = 'Severe';
                $status = 'Gridlocked';
            } elseif ($newSpeed < 35) {
                $congestion = 'Heavy';
                $status = 'Congested';
            } elseif ($newSpeed < 55) {
                $congestion = 'Moderate';
                $status = 'Alert';
            }

            $point->update([
                'speed' => $newSpeed,
                'congestion' => $congestion,
                'status' => $status,
            ]);
        }

        // 3. Update waste bins
        $bins = WasteBin::all();
        foreach ($bins as $bin) {
            if (rand(0, 100) > 70) {
                $newFill = min(100, $bin->fill_level + rand(1, 4));
                $status = 'Normal';
                if ($newFill > 85) $status = 'Critical';
                elseif ($newFill > 70) $status = 'Action Needed';

                $bin->update([
                    'fill_level' => $newFill,
                    'status' => $status,
                ]);
            }
        }

        // 4. Update sustainability metrics occasionally
        $metrics = SustainabilityMetric::first();
        if ($metrics) {
            $metrics->update([
                'carbon_offset' => $metrics->carbon_offset + 0.05,
                'total_plastics_collected' => $metrics->total_plastics_collected + (rand(0, 100) > 90 ? 1 : 0),
            ]);
        }

        // 5. Spawn new emergency with 5% probability
        if (rand(1, 100) <= 5) {
            $locations = ['Airport Expressway', 'Boardwalk D', 'Old Town Square', 'Tech Hub Stn'];
            $types = ['Traffic Stagnation', 'Fire Alarm Tripped', 'Lost Child Report', 'Suspicious Package'];
            $severities = ['Low', 'Medium', 'High'];

            Emergency::create([
                'id' => 'EMG-' . rand(415, 600),
                'location' => $locations[array_rand($locations)],
                'type' => $types[array_rand($types)],
                'severity' => $severities[array_rand($severities)],
                'status' => 'Pending Review',
                'reporter' => 'AI Visual Agent ' . rand(1, 5),
                'time_reported' => 'Just now',
            ]);
        }

        $telemetry = $this->gatherTelemetryData();
        event(new TelemetryUpdated($telemetry));

        return response()->json($telemetry);
    }

    private function gatherTelemetryData()
    {
        $crowdZones = CrowdZone::all();
        $trafficPoints = TrafficPoint::all();
        $emergencies = Emergency::orderBy('created_at', 'desc')->get();
        $wasteBins = WasteBin::all();
        $sustainability = SustainabilityMetric::first() ?: (object)[
            'eco_score' => 78,
            'carbon_offset' => 12.4,
            'total_plastics_collected' => 450,
            'green_fleet_ratio' => 65,
        ];

        // Gather all users with role 'agency' as compliance list
        $agencyUsers = User::where('role', 'agency')->get();
        $agencies = [];
        foreach ($agencyUsers as $index => $u) {
            $agencies[] = [
                'id' => $u->id,
                'name' => $u->name,
                'owner' => 'Vikram Joshi', // default owner
                'license' => 'L-Raj-' . (55312 + $index),
                'status' => is_null($u->deactivated_at) ? 'Approved' : 'Pending',
                'rating' => 4.6,
                'date' => $u->created_at->format('M d, Y'),
            ];
        }

        // Add additional pending ones if we want to show list approvals
        if (count($agencies) == 1) {
            $agencies[] = [
                'id' => 9991,
                'name' => 'Pristine Beach Tours',
                'owner' => 'Karan Malhotra',
                'license' => 'L-Goa-44129',
                'status' => 'Pending',
                'rating' => 0.0,
                'date' => 'May 20, 2026',
            ];
            $agencies[] = [
                'id' => 9992,
                'name' => 'Peak Adventure Co.',
                'owner' => 'Tenzing Norgay Jr.',
                'license' => 'L-HP-10023',
                'status' => 'Pending',
                'rating' => 0.0,
                'date' => 'May 21, 2026',
            ];
        }

        // Hardcode charts telemetry details similar to simulator
        $powerUsage = [
            ['hour' => '08:00', 'load' => 320],
            ['hour' => '10:00', 'load' => 450],
            ['hour' => '12:00', 'load' => 580],
            ['hour' => '14:00', 'load' => 610],
            ['hour' => '16:00', 'load' => 570],
            ['hour' => '18:00', 'load' => 740],
            ['hour' => '20:00', 'load' => 810],
            ['hour' => '22:00', 'load' => 620],
        ];

        $waterConsumption = [
            ['hour' => '08:00', 'flow' => 120],
            ['hour' => '10:00', 'flow' => 180],
            ['hour' => '12:00', 'flow' => 210],
            ['hour' => '14:00', 'flow' => 190],
            ['hour' => '16:00', 'flow' => 165],
            ['hour' => '18:00', 'flow' => 220],
            ['hour' => '20:00', 'flow' => 240],
            ['hour' => '22:00', 'flow' => 150],
        ];

        return [
            'crowdZones' => $crowdZones,
            'trafficPoints' => $trafficPoints,
            'publicTransports' => [
                ['id' => 'BUS-104', 'line' => 'Blue Route 4A', 'capacity' => 60, 'currentLoad' => rand(40, 58), 'status' => 'On Time', 'speed' => 38],
                ['id' => 'BUS-211', 'line' => 'Green Loop 12', 'capacity' => 45, 'currentLoad' => rand(10, 30), 'status' => 'Delayed', 'speed' => 25],
                ['id' => 'METRO-L1', 'line' => 'Metro Line 1 (Coastal)', 'capacity' => 400, 'currentLoad' => rand(250, 350), 'status' => 'On Time', 'speed' => 70],
                ['id' => 'BUS-098', 'line' => 'Airport Shuttle', 'capacity' => 30, 'currentLoad' => rand(15, 28), 'status' => 'On Time', 'speed' => 50],
            ],
            'emergencies' => $emergencies,
            'resources' => [
                'wasteBins' => $wasteBins,
                'powerUsage' => $powerUsage,
                'waterConsumption' => $waterConsumption,
            ],
            'agencies' => $agencies,
            'sustainability' => [
                'ecoScore' => $sustainability->eco_score ?? 78,
                'carbonOffset' => (float)($sustainability->carbon_offset ?? 12.4),
                'totalPlasticsCollected' => $sustainability->total_plastics_collected ?? 450,
                'greenFleetRatio' => $sustainability->green_fleet_ratio ?? 65,
            ]
        ];
    }
}
