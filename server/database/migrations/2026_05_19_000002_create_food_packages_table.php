<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('food_packages', function (Blueprint $table) {
            $table->id();
            $table->string('label'); // e.g. Vegetarian, Non-Vegetarian, Vegan
            $table->enum('type', ['veg', 'nonveg', 'vegan'])->default('veg');
            $table->decimal('price_per_day', 10, 2);
            $table->text('description')->nullable();
            $table->string('emoji')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('food_packages');
    }
};
