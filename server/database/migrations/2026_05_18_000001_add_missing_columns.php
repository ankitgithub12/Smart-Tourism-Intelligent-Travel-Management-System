<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add missing columns to tourist_places
        Schema::table('tourist_places', function (Blueprint $table) {
            if (!Schema::hasColumn('tourist_places', 'deleted_at')) {
                $table->timestamp('deleted_at')->nullable()->after('updated_at');
            }
            if (!Schema::hasColumn('tourist_places', 'images')) {
                $table->json('images')->nullable()->after('image')->comment('Array of Cloudinary image URLs');
            }
        });

        // Add missing columns to bookings
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'special_requests')) {
                $table->text('special_requests')->nullable()->after('number_of_people');
            }
            if (!Schema::hasColumn('bookings', 'cancelled_at')) {
                $table->timestamp('cancelled_at')->nullable()->after('updated_at');
            }
        });

        // Add missing columns to users
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'deactivated_at')) {
                $table->timestamp('deactivated_at')->nullable()->after('updated_at');
            }
            if (!Schema::hasColumn('users', 'avatar')) {
                $table->string('avatar')->nullable()->after('name');
            }
        });

        // Add missing columns to transports
        Schema::table('transports', function (Blueprint $table) {
            if (!Schema::hasColumn('transports', 'from_location')) {
                $table->string('from_location')->nullable()->after('route_name');
            }
            if (!Schema::hasColumn('transports', 'to_location')) {
                $table->string('to_location')->nullable()->after('from_location');
            }
            // vehicle_type already exists in transports table
            if (!Schema::hasColumn('transports', 'price_per_seat')) {
                $table->decimal('price_per_seat', 10, 2)->default(0)->after('capacity');
            }
            if (!Schema::hasColumn('transports', 'departure_time')) {
                $table->dateTime('departure_time')->nullable()->after('price_per_seat');
            }
            if (!Schema::hasColumn('transports', 'arrival_time')) {
                $table->dateTime('arrival_time')->nullable()->after('departure_time');
            }
        });

        // Create transport_bookings table if not exists
        if (!Schema::hasTable('transport_bookings')) {
            Schema::create('transport_bookings', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->foreignId('transport_id')->constrained()->onDelete('cascade');
                $table->integer('seats_booked')->default(1);
                $table->date('travel_date');
                $table->decimal('total_price', 10, 2)->default(0.00);
                $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('confirmed');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::table('tourist_places', function (Blueprint $table) {
            $table->dropColumnIfExists('deleted_at');
            $table->dropColumnIfExists('images');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumnIfExists('special_requests');
            $table->dropColumnIfExists('cancelled_at');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumnIfExists('deactivated_at');
            $table->dropColumnIfExists('avatar');
        });

        Schema::dropIfExists('transport_bookings');
    }
};
