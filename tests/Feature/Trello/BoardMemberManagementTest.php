<?php

namespace Tests\Feature\Trello;

use App\Models\User;
use App\Modules\Trello\Models\Board;
use App\Modules\Trello\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BoardMemberManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_add_and_remove_board_member_from_workspace_members(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();

        $workspace = Workspace::query()->create([
            'name' => 'Acme',
            'slug' => 'acme-members',
            'owner_id' => $owner->id,
        ]);

        $workspace->memberships()->createMany([
            ['user_id' => $owner->id, 'role' => 'owner'],
            ['user_id' => $member->id, 'role' => 'member'],
        ]);

        $board = Board::query()->create([
            'workspace_id' => $workspace->id,
            'created_by' => $owner->id,
            'name' => 'Ops',
            'visibility' => 'workspace',
            'position' => 0,
        ]);

        $board->memberships()->create(['user_id' => $owner->id, 'role' => 'owner']);

        Sanctum::actingAs($owner);

        $this->postJson("/api/boards/{$board->id}/members", [
            'user_id' => $member->id,
            'role' => 'member',
        ])->assertCreated();

        $this->assertDatabaseHas('board_members', [
            'board_id' => $board->id,
            'user_id' => $member->id,
        ]);

        $this->deleteJson("/api/boards/{$board->id}/members/{$member->id}")
            ->assertOk();

        $this->assertDatabaseMissing('board_members', [
            'board_id' => $board->id,
            'user_id' => $member->id,
        ]);
    }
}
