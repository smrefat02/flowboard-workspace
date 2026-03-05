<?php

namespace Tests\Feature\Trello;

use App\Models\User;
use App\Modules\Trello\Models\Board;
use App\Modules\Trello\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BoardAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_workspace_member_can_view_board_but_non_member_cannot(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $outsider = User::factory()->create();

        $workspace = Workspace::query()->create([
            'name' => 'Acme',
            'slug' => 'acme',
            'owner_id' => $owner->id,
        ]);

        $workspace->memberships()->createMany([
            ['user_id' => $owner->id, 'role' => 'owner'],
            ['user_id' => $member->id, 'role' => 'member'],
        ]);

        $board = Board::query()->create([
            'workspace_id' => $workspace->id,
            'created_by' => $owner->id,
            'name' => 'Roadmap',
            'visibility' => 'workspace',
            'position' => 0,
        ]);

        $board->memberships()->create(['user_id' => $owner->id, 'role' => 'owner']);

        Sanctum::actingAs($member);
        $this->getJson("/api/boards/{$board->id}")->assertOk();

        Sanctum::actingAs($outsider);
        $this->getJson("/api/boards/{$board->id}")->assertForbidden();
    }
}
