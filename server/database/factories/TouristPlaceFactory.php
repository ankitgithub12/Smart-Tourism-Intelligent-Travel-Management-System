<?php

namespace Database\Factories;

use App\Models\TouristPlace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TouristPlace>
 */
class TouristPlaceFactory extends Factory
{
    protected $model = TouristPlace::class;

    public function definition(): array
    {
        return [
            'name' => fake()->city() . ' Heritage Walk',
            'description' => fake()->sentence(),
            'location' => fake()->city(),
            'category' => 'historical monuments and culture',
            'image' => fake()->imageUrl(640, 480, 'travel'),
            'crowd_level' => fake()->numberBetween(5, 80),
            'rating' => fake()->randomFloat(2, 3.5, 5),
            'opening_hours' => ['open' => '09:00', 'close' => '18:00'],
            'entry_fee' => fake()->randomFloat(2, 0, 500),
        ];
    }
}
