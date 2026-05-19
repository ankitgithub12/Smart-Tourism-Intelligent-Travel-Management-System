<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cab_services', function (Blueprint $table) {
            $table->id();
            $table->string('label'); // e.g. Shared Cab, Private Cab, Luxury Car
            $table->enum('type', ['shared', 'private', 'luxury'])->default('private');
            $table->decimal('price', 10, 2); // Base price or price per day
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cab_services');
    }
};
