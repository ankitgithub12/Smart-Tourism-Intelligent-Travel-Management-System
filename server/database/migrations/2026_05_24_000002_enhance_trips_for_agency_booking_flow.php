<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->string('traveler_name')->nullable()->after('user_id');
            $table->foreignId('agency_package_id')->nullable()->after('travelers')->constrained('agency_packages')->nullOnDelete();
            $table->string('agency_guide_id')->nullable()->after('guide_id');
            $table->string('agency_vehicle_id')->nullable()->after('rental_vehicle_id');
            $table->timestamp('cancelled_at')->nullable()->after('status');

            $table->foreign('agency_guide_id')->references('id')->on('agency_guides')->nullOnDelete();
            $table->foreign('agency_vehicle_id')->references('id')->on('agency_vehicles')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropForeign(['agency_vehicle_id']);
            $table->dropForeign(['agency_guide_id']);
            $table->dropConstrainedForeignId('agency_package_id');
            $table->dropColumn(['traveler_name', 'agency_guide_id', 'agency_vehicle_id', 'cancelled_at']);
        });
    }
};
