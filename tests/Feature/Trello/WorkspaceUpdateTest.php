<?php

namespace Tests\Feature\Trello;

use App\Models\User;
use App\Modules\Trello\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WorkspaceUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_rename_workspace(): void
    {
        $owner = User::factory()->create();

        $workspace = Workspace::query()->create([
            'name' => 'Acme Workspace',
            'slug' => 'acme-workspace',
            'owner_id' => $owner->id,
        ]);

        $workspace->memberships()->create([
            'user_id' => $owner->id,
            'role' => 'owner',
        ]);

        Sanctum::actingAs($owner);

        $this->patchJson("/api/workspaces/{$workspace->id}", [
            'name' => 'Growth Team Workspace',
        ])->assertOk()
            ->assertJsonPath('data.name', 'Growth Team Workspace');

        $this->assertDatabaseHas('workspaces', [
            'id' => $workspace->id,
            'name' => 'Growth Team Workspace',
        ]);
    }

    public function test_non_manager_cannot_rename_workspace(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();

        $workspace = Workspace::query()->create([
            'name' => 'Acme Workspace',
            'slug' => 'acme-workspace-permissions',
            'owner_id' => $owner->id,
        ]);

        $workspace->memberships()->createMany([
            ['user_id' => $owner->id, 'role' => 'owner'],
            ['user_id' => $member->id, 'role' => 'member'],
        ]);

        Sanctum::actingAs($member);

        $this->patchJson("/api/workspaces/{$workspace->id}", [
            'name' => 'Unauthorized Rename',
        ])->assertForbidden();

        $this->assertDatabaseHas('workspaces', [
            'id' => $workspace->id,
            'name' => 'Acme Workspace',
        ]);
    }
}
