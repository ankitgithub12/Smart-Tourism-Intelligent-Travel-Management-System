<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TouristAssistanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_tourist_can_fetch_live_assistance_data_from_map_providers()
    {
        config()->set('cache.default', 'array');
        config()->set('services.google_maps.key', 'maps-test-key');

        Http::fake([
            'https://maps.googleapis.com/maps/api/geocode/json*' => Http::sequence()
                ->push(['results' => [['formatted_address' => 'Goa, India', 'geometry' => ['location' => ['lat' => 15.2993, 'lng' => 74.1240]]]]])
                ->push(['results' => [['formatted_address' => 'Mumbai, India', 'geometry' => ['location' => ['lat' => 19.0760, 'lng' => 72.8777]]]]]),
            'https://places.googleapis.com/v1/places:searchNearby' => Http::response([
                'places' => [[
                    'id' => 'service-1',
                    'displayName' => ['text' => 'Nearby Service'],
                    'formattedAddress' => 'Central Goa',
                    'location' => ['latitude' => 15.29931, 'longitude' => 74.12401],
                    'businessStatus' => 'OPERATIONAL',
                ]],
            ]),
            'https://routes.googleapis.com/directions/v2:computeRoutes' => Http::response([
                'routes' => [[
                    'duration' => '4800s',
                    'staticDuration' => '4200s',
                    'distanceMeters' => 580000,
                ]],
            ]),
        ]);

        $tourist = User::factory()->create(['role' => 'tourist']);

        $response = $this->actingAs($tourist)->getJson('/api/tourist/assistance?destination=Goa&origin=Mumbai&refresh=true');

        $response->assertOk()
            ->assertJsonPath('source.services', 'Google Places')
            ->assertJsonPath('services.hospitals.0.name', 'Nearby Service')
            ->assertJsonPath('services.hospitals.0.distance', '2 m')
            ->assertJsonPath('route.traffic.available', true)
            ->assertJsonPath('route.traffic.delay_minutes', 10);

        Http::assertSent(fn ($request) => str_contains($request->url(), 'places.googleapis.com'));
        Http::assertSent(fn ($request) => str_contains($request->url(), 'routes.googleapis.com'));
    }
}
