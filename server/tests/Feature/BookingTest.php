<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\TouristPlace;
use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_tourist_can_create_booking()
    {
        $tourist = User::factory()->create(['role' => 'tourist']);
        $place = TouristPlace::factory()->create();

        $response = $this->actingAs($tourist)->postJson('/api/bookings', [
            'tourist_place_id' => $place->id,
            'booking_date' => now()->addDays(2)->toDateString(),
            'number_of_people' => 2,
            'special_requests' => 'None',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('bookings', [
            'user_id' => $tourist->id,
            'tourist_place_id' => $place->id,
            'status' => 'pending',
        ]);
    }

    public function test_admin_can_confirm_booking()
    {
        $admin = User::factory()->create(['role' => 'authority']);
        $booking = Booking::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($admin)->postJson("/api/bookings/{$booking->id}/confirm");

        $response->assertStatus(200);
        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'confirmed',
        ]);
    }
}
