<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\TouristPlace;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->create(['role' => 'tourist'])->id,
            'tourist_place_id' => TouristPlace::factory(),
            'booking_date' => fake()->dateTimeBetween('+1 day', '+1 month')->format('Y-m-d'),
            'time_slot' => '10:00:00',
            'number_of_people' => fake()->numberBetween(1, 5),
            'total_price' => fake()->randomFloat(2, 500, 15000),
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ];
    }
}
