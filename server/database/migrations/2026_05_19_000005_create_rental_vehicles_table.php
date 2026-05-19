<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rental_vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // SUV, Sedan, Bike, Scooter, EV
            $table->integer('seats');
            $table->string('fuel'); // Petrol, Diesel, Electric
            $table->decimal('price_per_day', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rental_vehicles');
    }
};
