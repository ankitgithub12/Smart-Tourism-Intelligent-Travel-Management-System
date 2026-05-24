<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('approval_status')->nullable()->after('role');
        });

        DB::table('users')
            ->where('role', 'agency')
            ->update(['approval_status' => 'approved']);

        foreach (['agency_packages', 'agency_tours', 'agency_vehicles', 'agency_guides'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->foreignId('agency_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('users')
                    ->nullOnDelete();
            });
        }

        $existingAgencyId = DB::table('users')
            ->where('role', 'agency')
            ->where('approval_status', 'approved')
            ->orderBy('id')
            ->value('id');

        if ($existingAgencyId) {
            foreach (['agency_packages', 'agency_tours', 'agency_vehicles', 'agency_guides'] as $tableName) {
                DB::table($tableName)
                    ->whereNull('agency_id')
                    ->update(['agency_id' => $existingAgencyId]);
            }
        }
    }

    public function down(): void
    {
        foreach (['agency_guides', 'agency_vehicles', 'agency_tours', 'agency_packages'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropConstrainedForeignId('agency_id');
            });
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('approval_status');
        });
    }
};
