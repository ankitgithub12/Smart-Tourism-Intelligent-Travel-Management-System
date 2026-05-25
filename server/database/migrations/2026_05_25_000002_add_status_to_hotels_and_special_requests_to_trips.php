<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->string('status')->default('Active')->after('amenities');
        });

        Schema::table('trips', function (Blueprint $table) {
            $table->text('special_requests')->nullable()->after('total_price');
        });

        Schema::table('agency_packages', function (Blueprint $table) {
            $table->text('itinerary')->nullable()->after('image');
        });

        Schema::table('agency_guides', function (Blueprint $table) {
            $table->decimal('price_per_day', 10, 2)->default(1200.00)->after('contact');
        });

        Schema::table('agency_vehicles', function (Blueprint $table) {
            $table->decimal('price_per_day', 10, 2)->default(1800.00)->after('location');
        });
    }

    public function down(): void
    {
        Schema::table('agency_vehicles', function (Blueprint $table) {
            $table->dropColumn('price_per_day');
        });

        Schema::table('agency_guides', function (Blueprint $table) {
            $table->dropColumn('price_per_day');
        });

        Schema::table('agency_packages', function (Blueprint $table) {
            $table->dropColumn('itinerary');
        });

        Schema::table('trips', function (Blueprint $table) {
            $table->dropColumn('special_requests');
        });

        Schema::table('hotels', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
