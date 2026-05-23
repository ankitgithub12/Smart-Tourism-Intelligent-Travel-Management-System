<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TelemetrySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Crowd Zones
        DB::table('crowd_zones')->truncate();
        DB::table('crowd_zones')->insert([
            ['id' => 'zone-1', 'name' => 'Beach Road Boardwalk', 'density' => 78, 'visitors' => 1420, 'status' => 'Critical', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'zone-2', 'name' => 'Old Town Square', 'density' => 64, 'visitors' => 980, 'status' => 'High', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'zone-3', 'name' => 'City Museum Complex', 'density' => 42, 'visitors' => 450, 'status' => 'Moderate', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'zone-4', 'name' => 'Central Transit Hub', 'density' => 85, 'visitors' => 2100, 'status' => 'Critical', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'zone-5', 'name' => 'Shopping Arcade East', 'density' => 31, 'visitors' => 320, 'status' => 'Low', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 2. Traffic Points
        DB::table('traffic_points')->truncate();
        DB::table('traffic_points')->insert([
            ['id' => 'tf-1', 'name' => 'Airport Expressway', 'speed' => 68, 'congestion' => 'Low', 'status' => 'Clear', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'tf-2', 'name' => 'Museum Bypass Junction', 'speed' => 22, 'congestion' => 'Heavy', 'status' => 'Congested', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'tf-3', 'name' => 'Coastal Ring Road', 'speed' => 45, 'congestion' => 'Moderate', 'status' => 'Alert', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'tf-4', 'name' => 'Market Main Blvd', 'speed' => 12, 'congestion' => 'Severe', 'status' => 'Gridlocked', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 3. Emergencies
        DB::table('emergencies')->truncate();
        DB::table('emergencies')->insert([
            ['id' => 'EMG-412', 'location' => 'Beach Road (Zone 1)', 'type' => 'Medical Aid Required', 'severity' => 'High', 'status' => 'Dispatched', 'reporter' => 'CCTV AI Cam 3', 'time_reported' => '2 mins ago', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'EMG-413', 'location' => 'Museum Bypass', 'type' => 'Minor Fender Bender', 'severity' => 'Medium', 'status' => 'En Route', 'reporter' => 'Traffic Police', 'time_reported' => '12 mins ago', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'EMG-414', 'location' => 'Central Hub Level 2', 'type' => 'Crowd Gate Blockage', 'severity' => 'Low', 'status' => 'Resolved', 'reporter' => 'Staff Checkpoint', 'time_reported' => '40 mins ago', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 4. Waste Bins
        DB::table('waste_bins')->truncate();
        DB::table('waste_bins')->insert([
            ['id' => 'WB-01', 'location' => 'Boardwalk A', 'fill_level' => 89, 'status' => 'Action Needed', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'WB-02', 'location' => 'Boardwalk D', 'fill_level' => 42, 'status' => 'Normal', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'WB-03', 'location' => 'Museum Gate', 'fill_level' => 95, 'status' => 'Critical', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'WB-04', 'location' => 'Central Hub Plaza', 'fill_level' => 25, 'status' => 'Normal', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 5. Sustainability Metrics
        DB::table('sustainability_metrics')->truncate();
        DB::table('sustainability_metrics')->insert([
            ['id' => 1, 'eco_score' => 78, 'carbon_offset' => 12.40, 'total_plastics_collected' => 450, 'green_fleet_ratio' => 65, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 6. Agency Packages
        DB::table('agency_packages')->truncate();
        DB::table('agency_packages')->insert([
            ['id' => 1, 'name' => 'Ocean Breeze Escape', 'destination' => 'Baga, Goa', 'duration' => '3 Days, 2 Nights', 'price' => 12500.00, 'status' => 'Active', 'bookings' => 24, 'image' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Mountain Peak Trekking', 'destination' => 'Manali, HP', 'duration' => '5 Days, 4 Nights', 'price' => 18900.00, 'status' => 'Active', 'bookings' => 18, 'image' => 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&auto=format&fit=crop&q=60', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Royal Heritage Quest', 'destination' => 'Jaipur, Rajasthan', 'duration' => '4 Days, 3 Nights', 'price' => 15400.00, 'status' => 'Active', 'bookings' => 31, 'image' => 'https://images.unsplash.com/photo-1477584308800-b44223df0b15?w=500&auto=format&fit=crop&q=60', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Desert Dune Safari', 'destination' => 'Jaisalmer, Rajasthan', 'duration' => '2 Days, 1 Night', 'price' => 8900.00, 'status' => 'Active', 'bookings' => 12, 'image' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 7. Agency Tours
        DB::table('agency_tours')->truncate();
        DB::table('agency_tours')->insert([
            ['id' => 'T-101', 'package_name' => 'Ocean Breeze Escape', 'date' => '2026-05-25', 'time' => '09:00 AM', 'guide_name' => 'Arun Kumar', 'status' => 'Upcoming', 'capacity' => 15, 'filled' => 12, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'T-102', 'package_name' => 'Royal Heritage Quest', 'date' => '2026-05-26', 'time' => '10:30 AM', 'guide_name' => 'Meera Sen', 'status' => 'Fully Booked', 'capacity' => 20, 'filled' => 20, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'T-103', 'package_name' => 'Desert Dune Safari', 'date' => '2026-05-28', 'time' => '04:00 PM', 'guide_name' => 'Rajesh Yadav', 'status' => 'Upcoming', 'capacity' => 25, 'filled' => 15, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 8. Agency Vehicles
        DB::table('agency_vehicles')->truncate();
        DB::table('agency_vehicles')->insert([
            ['id' => 'V-001', 'model' => 'Toyota Innova Crysta', 'type' => 'Cab', 'driver' => 'Sanjay Dutt', 'current_load' => 4, 'status' => 'Active', 'fuel' => 82, 'location' => 'Near Airport', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'V-002', 'model' => 'Force Traveller (17 str)', 'type' => 'Mini Bus', 'driver' => 'Karan Singh', 'current_load' => 12, 'status' => 'Active', 'fuel' => 65, 'location' => 'City Center', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'V-003', 'model' => 'Mahindra Scorpio', 'type' => 'SUV', 'driver' => 'Vikram Pal', 'current_load' => 0, 'status' => 'Idle', 'fuel' => 90, 'location' => 'Office Depot', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'V-004', 'model' => 'Tempo Traveller (12 str)', 'type' => 'Mini Bus', 'driver' => 'Rajesh Nair', 'current_load' => 0, 'status' => 'Maintenance', 'fuel' => 40, 'location' => 'Service Workshop', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 9. Agency Guides
        DB::table('agency_guides')->truncate();
        DB::table('agency_guides')->insert([
            ['id' => 'G-201', 'name' => 'Arun Kumar', 'specialty' => 'Goa Heritage & Beaches', 'rating' => 4.90, 'status' => 'Assigned', 'active_tours' => 2, 'contact' => '+91 98765 43210', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'G-202', 'name' => 'Meera Sen', 'specialty' => 'Historical Architecture', 'rating' => 4.80, 'status' => 'Assigned', 'active_tours' => 1, 'contact' => '+91 98765 43211', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'G-203', 'name' => 'Rajesh Yadav', 'specialty' => 'Desert survival & culture', 'rating' => 4.70, 'status' => 'Available', 'active_tours' => 0, 'contact' => '+91 98765 43212', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'G-204', 'name' => 'Sneha Sharma', 'specialty' => 'Himalayan Mountaineering', 'rating' => 4.90, 'status' => 'Available', 'active_tours' => 0, 'contact' => '+91 98765 43213', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
