<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\TouristPlace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_anyone_can_view_places()
    {
        TouristPlace::factory()->count(3)->create();

        $response = $this->getJson('/api/places');

        $response->assertStatus(200)
                 ->assertJsonStructure(['data' => [['id', 'name', 'location']]]);
    }

    public function test_admin_can_create_place()
    {
        $admin = User::factory()->create(['role' => 'authority']);

        $response = $this->actingAs($admin)->postJson('/api/places', [
            'name' => 'New Awesome Place',
            'location' => 'Paris',
            'category' => 'historical monuments and culture',
            'entry_fee' => 50,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('tourist_places', ['name' => 'New Awesome Place']);
    }

    public function test_tourist_cannot_create_place()
    {
        $tourist = User::factory()->create(['role' => 'tourist']);

        $response = $this->actingAs($tourist)->postJson('/api/places', [
            'name' => 'Should fail',
            'location' => 'Nowhere',
            'category' => 'beaches and coastal areas'
        ]);

        $response->assertStatus(403);
    }
}
