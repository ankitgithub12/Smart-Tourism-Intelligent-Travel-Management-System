<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\AgencyPackage;
use App\Models\Hotel;
use App\Models\Trip;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgencyEnhancementTest extends TestCase
{
    use RefreshDatabase;

    private User $agency;
    private User $tourist;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.real_city.enabled' => false]);

        $this->agency = User::factory()->create([
            'role' => 'agency',
            'approval_status' => 'approved',
        ]);

        $this->tourist = User::factory()->create([
            'role' => 'tourist',
        ]);
    }

    public function test_can_edit_package_and_toggle_status(): void
    {
        $package = AgencyPackage::create([
            'agency_id' => $this->agency->id,
            'name' => 'Original Name',
            'destination' => 'Original Destination',
            'price' => 5000,
            'duration' => '3 Days',
            'status' => 'Active',
        ]);

        // Edit package
        $response = $this->actingAs($this->agency)->putJson("/api/agency/packages/{$package->id}", [
            'name' => 'Updated Name',
            'destination' => 'Updated Destination',
            'price' => 6000,
            'duration' => '4 Days',
            'itinerary' => 'Day 1: Arrival',
            'status' => 'Active',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('agency_packages', [
            'id' => $package->id,
            'name' => 'Updated Name',
            'destination' => 'Updated Destination',
            'price' => 6000,
            'itinerary' => 'Day 1: Arrival',
        ]);

        // Toggle Status
        $response = $this->actingAs($this->agency)->patchJson("/api/agency/packages/{$package->id}/status", [
            'status' => 'Inactive',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('agency_packages', [
            'id' => $package->id,
            'status' => 'Inactive',
        ]);
    }

    public function test_inactive_hotels_and_packages_are_filtered_from_listings(): void
    {
        $activePackage = AgencyPackage::create([
            'agency_id' => $this->agency->id,
            'name' => 'Active Package',
            'destination' => 'Goa Beach',
            'price' => 5000,
            'duration' => '3 Days',
            'status' => 'Active',
        ]);

        $inactivePackage = AgencyPackage::create([
            'agency_id' => $this->agency->id,
            'name' => 'Inactive Package',
            'destination' => 'Manali Adventure',
            'price' => 5000,
            'duration' => '3 Days',
            'status' => 'Inactive',
        ]);

        $activeHotel = Hotel::create([
            'agency_id' => $this->agency->id,
            'name' => 'Active Hotel',
            'location' => 'Goa',
            'stars' => 4,
            'price_per_night' => 2000,
            'status' => 'Active',
        ]);

        $inactiveHotel = Hotel::create([
            'agency_id' => $this->agency->id,
            'name' => 'Inactive Hotel',
            'location' => 'Manali',
            'stars' => 4,
            'price_per_night' => 2000,
            'status' => 'Inactive',
        ]);

        // Public listing packages
        $this->getJson('/api/packages')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Active Package'])
            ->assertJsonMissing(['name' => 'Inactive Package']);

        // Public listing hotels
        $this->getJson('/api/hotels')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Active Hotel'])
            ->assertJsonMissing(['name' => 'Inactive Hotel']);
    }

    public function test_tourist_can_book_package_directly(): void
    {
        $package = AgencyPackage::create([
            'agency_id' => $this->agency->id,
            'name' => 'Goa Beach Fun',
            'destination' => 'Goa',
            'price' => 5000,
            'duration' => '3 Days',
            'status' => 'Active',
        ]);

        $response = $this->actingAs($this->tourist)->postJson('/api/trips', [
            'traveler_name' => 'John Doe',
            'from_location' => 'Mumbai',
            'to_destination' => 'Goa',
            'departure_date' => now()->addDays(2)->toDateString(),
            'return_date' => now()->addDays(4)->toDateString(),
            'travelers' => 2,
            'agency_package_id' => $package->id,
            'subtotal' => 10000,
            'tax' => 500,
            'discount' => 0,
            'total_price' => 10500,
            'status' => 'confirmed',
            'special_requests' => 'Sea view room please',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('trips', [
            'user_id' => $this->tourist->id,
            'agency_package_id' => $package->id,
            'status' => 'confirmed',
            'special_requests' => 'Sea view room please',
        ]);

        // The bookings count should have incremented
        $package->refresh();
        $this->assertEquals(1, $package->bookings);

        // Fetch agency dashboard and verify analytics
        $dashboardResponse = $this->actingAs($this->agency)->getJson('/api/agency/dashboard');
        $dashboardResponse->assertOk()
            ->assertJsonPath('analytics.totalSales', 1)
            ->assertJsonPath('analytics.totalRevenue', 10500)
            ->assertJsonPath('analytics.popularPackage.name', 'Goa Beach Fun');
    }
}
