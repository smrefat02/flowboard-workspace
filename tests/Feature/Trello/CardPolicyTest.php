<?php

namespace Tests\Feature\Trello;

use App\Models\User;
use App\Modules\Trello\Models\Board;
use App\Modules\Trello\Models\Card;
use App\Modules\Trello\Models\TrelloList;
use App\Modules\Trello\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CardPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_board_members_can_modify_cards(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $outsider = User::factory()->create();

        $workspace = Workspace::query()->create([
            'name' => 'Acme',
            'slug' => 'acme-team',
            'owner_id' => $owner->id,
        ]);

        $workspace->memberships()->createMany([
            ['user_id' => $owner->id, 'role' => 'owner'],
            ['user_id' => $member->id, 'role' => 'member'],
        ]);

        $board = Board::query()->create([
            'workspace_id' => $workspace->id,
            'created_by' => $owner->id,
            'name' => 'Delivery',
            'visibility' => 'workspace',
            'position' => 0,
        ]);

        $board->memberships()->createMany([
            ['user_id' => $owner->id, 'role' => 'owner'],
            ['user_id' => $member->id, 'role' => 'member'],
        ]);

        $list = TrelloList::query()->create([
            'board_id' => $board->id,
            'title' => 'Doing',
            'position' => 0,
        ]);

        $card = Card::query()->create([
            'list_id' => $list->id,
            'creator_id' => $owner->id,
            'title' => 'Implement policies',
            'position' => 0,
        ]);

        Sanctum::actingAs($member);
        $this->patchJson("/api/cards/{$card->id}", ['title' => 'Updated by member'])
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated by member');

        Sanctum::actingAs($outsider);
        $this->patchJson("/api/cards/{$card->id}", ['title' => 'Outsider update'])
            ->assertForbidden();
    }
}
