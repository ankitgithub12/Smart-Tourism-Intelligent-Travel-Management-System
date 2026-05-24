<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgencyApprovalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.real_city.enabled' => false]);
    }

    public function test_new_agency_registration_waits_for_authority_approval(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Live Route Travels',
            'email' => 'agency@example.com',
            'password' => 'Password123',
            'role' => 'agency',
        ]);

        $response->assertStatus(202)
            ->assertJson([
                'requires_approval' => true,
                'user' => ['role' => 'agency', 'approval_status' => 'pending'],
            ])
            ->assertJsonMissing(['token']);

        $this->postJson('/api/login', [
            'email' => 'agency@example.com',
            'password' => 'Password123',
        ])->assertForbidden();
    }

    public function test_authority_approval_unlocks_agency_portal_and_saved_actions(): void
    {
        $authority = User::factory()->create(['role' => 'authority']);
        $agency = User::factory()->create([
            'role' => 'agency',
            'approval_status' => 'pending',
            'password' => bcrypt('Password123'),
        ]);

        $this->actingAs($agency)->getJson('/api/agency/dashboard')->assertForbidden();
        $this->actingAs($agency)
            ->postJson('/api/transports', [])
            ->assertForbidden();

        $this->actingAs($authority)
            ->postJson('/api/admin/agencies/' . $agency->id . '/update-status', ['status' => 'Approved'])
            ->assertOk();

        $agency->refresh();
        $this->assertSame('approved', $agency->approval_status);

        $this->postJson('/api/login', [
            'email' => $agency->email,
            'password' => 'Password123',
        ])->assertOk()->assertJsonStructure(['token']);

        $created = $this->actingAs($agency)->postJson('/api/agency/guides', [
            'name' => 'Maya Singh',
            'specialty' => 'Heritage Walks',
            'contact' => '+91 99999 11111',
        ]);

        $created->assertOk()
            ->assertJsonPath('agency.guides.0.rating', 5)
            ->assertJsonPath('agency.guides.0.activeTours', 0);

        $guideId = $created->json('agency.guides.0.id');
        $this->actingAs($agency)
            ->patchJson('/api/agency/guides/' . $guideId . '/status', ['status' => 'Unavailable'])
            ->assertOk()
            ->assertJsonPath('agency.guides.0.status', 'Unavailable');
    }

    public function test_agency_assets_are_not_visible_to_another_agency(): void
    {
        $firstAgency = User::factory()->create(['role' => 'agency', 'approval_status' => 'approved']);
        $secondAgency = User::factory()->create(['role' => 'agency', 'approval_status' => 'approved']);

        $this->actingAs($firstAgency)->postJson('/api/agency/packages', [
            'name' => 'Jaipur Heritage Day',
            'destination' => 'Jaipur',
            'price' => 2400,
        ])->assertOk();

        $this->actingAs($secondAgency)
            ->getJson('/api/agency/dashboard')
            ->assertOk()
            ->assertJsonCount(0, 'packages');
    }
}
