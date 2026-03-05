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

class ReorderFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_lists_and_cards_can_be_reordered(): void
    {
        $owner = User::factory()->create();

        $workspace = Workspace::query()->create([
            'name' => 'Acme',
            'slug' => 'acme-reorder',
            'owner_id' => $owner->id,
        ]);

        $workspace->memberships()->create(['user_id' => $owner->id, 'role' => 'owner']);

        $board = Board::query()->create([
            'workspace_id' => $workspace->id,
            'created_by' => $owner->id,
            'name' => 'Roadmap',
            'visibility' => 'workspace',
            'position' => 0,
        ]);

        $board->memberships()->create(['user_id' => $owner->id, 'role' => 'owner']);

        $listA = TrelloList::query()->create(['board_id' => $board->id, 'title' => 'A', 'position' => 0]);
        $listB = TrelloList::query()->create(['board_id' => $board->id, 'title' => 'B', 'position' => 1]);

        $card1 = Card::query()->create([
            'list_id' => $listA->id,
            'creator_id' => $owner->id,
            'title' => 'Card 1',
            'position' => 0,
        ]);

        $card2 = Card::query()->create([
            'list_id' => $listA->id,
            'creator_id' => $owner->id,
            'title' => 'Card 2',
            'position' => 1,
        ]);

        Sanctum::actingAs($owner);

        $this->postJson("/api/boards/{$board->id}/lists/reorder", [
            'ordered_ids' => [$listB->id, $listA->id],
        ])->assertOk();

        $this->assertSame(0, TrelloList::query()->findOrFail($listB->id)->position);
        $this->assertSame(1, TrelloList::query()->findOrFail($listA->id)->position);

        $this->postJson('/api/cards/reorder', [
            'cards_by_list' => [
                $listB->id => [$card2->id, $card1->id],
                $listA->id => [],
            ],
        ])->assertOk();

        $this->assertSame($listB->id, Card::query()->findOrFail($card1->id)->list_id);
        $this->assertSame(1, Card::query()->findOrFail($card1->id)->position);
    }
}
