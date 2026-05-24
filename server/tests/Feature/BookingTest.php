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

    public function test_agency_cannot_create_tourist_booking()
    {
        $agency = User::factory()->create(['role' => 'agency']);

        $response = $this->actingAs($agency)->postJson('/api/bookings', [
            'tourist_place_id' => 999,
            'booking_date' => now()->addDays(2)->toDateString(),
            'number_of_people' => 2,
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('bookings', [
            'user_id' => $agency->id,
        ]);
    }

    public function test_non_tourists_cannot_access_trip_or_favorite_workflows()
    {
        $agency = User::factory()->create(['role' => 'agency']);
        $authority = User::factory()->create(['role' => 'authority']);

        $this->actingAs($agency)->getJson('/api/trips')->assertForbidden();
        $this->actingAs($authority)->getJson('/api/favorites')->assertForbidden();
        $this->actingAs($agency)->postJson('/api/bookings/999/cancel')->assertForbidden();
        $this->actingAs($authority)->getJson('/api/tourist/assistance?destination=Jaipur')->assertForbidden();
    }
}
