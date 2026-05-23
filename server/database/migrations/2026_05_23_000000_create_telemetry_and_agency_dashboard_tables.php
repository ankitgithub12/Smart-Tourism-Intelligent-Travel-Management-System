<?php
// server/database/migrations/2026_05_23_000000_create_telemetry_and_agency_dashboard_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Crowd Zones
        Schema::create('crowd_zones', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('density')->default(0);
            $table->integer('visitors')->default(0);
            $table->string('status')->default('Low');
            $table->timestamps();
        });

        // 2. Traffic Points
        Schema::create('traffic_points', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('speed')->default(60);
            $table->string('congestion')->default('Low');
            $table->string('status')->default('Clear');
            $table->timestamps();
        });

        // 3. Emergencies
        Schema::create('emergencies', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('location');
            $table->string('type');
            $table->string('severity')->default('Medium');
            $table->string('status')->default('Pending Review');
            $table->string('reporter');
            $table->string('time_reported')->nullable();
            $table->timestamps();
        });

        // 4. Waste Bins
        Schema::create('waste_bins', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('location');
            $table->integer('fill_level')->default(0);
            $table->string('status')->default('Normal');
            $table->timestamps();
        });

        // 5. Sustainability Metrics
        Schema::create('sustainability_metrics', function (Blueprint $table) {
            $table->id();
            $table->integer('eco_score')->default(75);
            $table->decimal('carbon_offset', 8, 2)->default(0.00);
            $table->integer('total_plastics_collected')->default(0);
            $table->integer('green_fleet_ratio')->default(0);
            $table->timestamps();
        });

        // 6. Agency Packages
        Schema::create('agency_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('destination');
            $table->string('duration');
            $table->decimal('price', 10, 2);
            $table->string('status')->default('Active');
            $table->integer('bookings')->default(0);
            $table->string('image')->nullable();
            $table->timestamps();
        });

        // 7. Agency Tours
        Schema::create('agency_tours', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('package_name');
            $table->date('date');
            $table->string('time');
            $table->string('guide_name');
            $table->string('status')->default('Upcoming');
            $table->integer('capacity')->default(15);
            $table->integer('filled')->default(0);
            $table->timestamps();
        });

        // 8. Agency Vehicles
        Schema::create('agency_vehicles', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('model');
            $table->string('type');
            $table->string('driver');
            $table->integer('current_load')->default(0);
            $table->string('status')->default('Idle');
            $table->integer('fuel')->default(100);
            $table->string('location');
            $table->timestamps();
        });

        // 9. Agency Guides
        Schema::create('agency_guides', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('specialty');
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->string('status')->default('Available');
            $table->integer('active_tours')->default(0);
            $table->string('contact');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crowd_zones');
        Schema::dropIfExists('traffic_points');
        Schema::dropIfExists('emergencies');
        Schema::dropIfExists('waste_bins');
        Schema::dropIfExists('sustainability_metrics');
        Schema::dropIfExists('agency_packages');
        Schema::dropIfExists('agency_tours');
        Schema::dropIfExists('agency_vehicles');
        Schema::dropIfExists('agency_guides');
    }
};
