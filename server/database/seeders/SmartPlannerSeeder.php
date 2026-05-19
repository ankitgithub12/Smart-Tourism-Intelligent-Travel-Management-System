<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SmartPlannerSeeder extends Seeder
{
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();

        // 1. Hotels
        DB::table('hotels')->truncate();
        DB::table('hotels')->insert([
            [
                'id' => 1,
                'name' => 'Ocean Pearl Resort',
                'location' => 'Goa',
                'stars' => 5,
                'price_per_night' => 8500.00,
                'rating' => 4.9,
                'reviews_count' => 120,
                'image' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format',
                'amenities' => json_encode(['Beach View', 'Pool', 'WiFi', 'Breakfast']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Comfort Inn Suites',
                'location' => 'Goa',
                'stars' => 4,
                'price_per_night' => 4500.00,
                'rating' => 4.6,
                'reviews_count' => 85,
                'image' => 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&auto=format',
                'amenities' => json_encode(['WiFi', 'Parking', 'Restaurant']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Budget Stay Express',
                'location' => 'Goa',
                'stars' => 3,
                'price_per_night' => 2000.00,
                'rating' => 4.2,
                'reviews_count' => 40,
                'image' => 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&auto=format',
                'amenities' => json_encode(['WiFi', 'AC']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 2. Food Packages
        DB::table('food_packages')->truncate();
        DB::table('food_packages')->insert([
            [
                'id' => 1,
                'label' => 'Vegetarian',
                'type' => 'veg',
                'price_per_day' => 800.00,
                'emoji' => '🥗',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'label' => 'Non-Vegetarian',
                'type' => 'nonveg',
                'price_per_day' => 1000.00,
                'emoji' => '🍗',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'label' => 'Vegan',
                'type' => 'vegan',
                'price_per_day' => 900.00,
                'emoji' => '🌱',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 3. Cab Services
        DB::table('cab_services')->truncate();
        DB::table('cab_services')->insert([
            [
                'id' => 1,
                'label' => 'Shared Cab',
                'type' => 'shared',
                'price' => 500.00,
                'description' => 'Affordable, shared ride',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'label' => 'Private Cab',
                'type' => 'private',
                'price' => 1500.00,
                'description' => 'Comfortable sedan',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'label' => 'Luxury Car',
                'type' => 'luxury',
                'price' => 3500.00,
                'description' => 'Premium experience',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 4. Guides
        DB::table('guides')->truncate();
        DB::table('guides')->insert([
            [
                'id' => 1,
                'name' => 'Rajesh Kumar',
                'type' => 'Local Guide',
                'rating' => 4.8,
                'experience' => '5 years',
                'languages' => 'Hindi, English',
                'price_per_day' => 1200.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Maria Fernandes',
                'type' => 'Professional',
                'rating' => 4.9,
                'experience' => '8 years',
                'languages' => 'English, Portuguese',
                'price_per_day' => 2000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Akira Tanaka',
                'type' => 'Multilingual',
                'rating' => 4.7,
                'experience' => '6 years',
                'languages' => 'English, Japanese, Hindi',
                'price_per_day' => 2500.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 5. Rental Vehicles
        DB::table('rental_vehicles')->truncate();
        DB::table('rental_vehicles')->insert([
            [
                'id' => 1,
                'type' => 'SUV',
                'seats' => 7,
                'fuel' => 'Diesel',
                'price_per_day' => 2500.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'type' => 'Sedan',
                'seats' => 4,
                'fuel' => 'Petrol',
                'price_per_day' => 1800.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'type' => 'Bike',
                'seats' => 2,
                'fuel' => 'Petrol',
                'price_per_day' => 600.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'type' => 'Scooter',
                'seats' => 2,
                'fuel' => 'Petrol',
                'price_per_day' => 400.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'type' => 'Electric Vehicle',
                'seats' => 4,
                'fuel' => 'Electric',
                'price_per_day' => 2000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
    }
}
