<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transports', function (Blueprint $table) {
            $table->id();
            $table->string('vehicle_type'); // Bus, Van, Electric Rickshaw
            $table->string('vehicle_number')->unique();
            $table->string('route_name');
            $table->string('current_location')->nullable();
            $table->integer('capacity')->default(0);
            $table->integer('current_load')->default(0); // number of passengers
            $table->string('status')->default('active'); // active, maintenance, delayed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transports');
    }
};
