<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guides', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // Local Guide, Professional, Multilingual
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->string('experience')->nullable();
            $table->string('languages')->nullable();
            $table->decimal('price_per_day', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guides');
    }
};
