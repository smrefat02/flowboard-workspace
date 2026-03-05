<?php

namespace App\Modules\Trello\Repositories;

use App\Modules\Trello\Models\Card;
use App\Modules\Trello\Models\TrelloList;

class CardRepository
{
    public function create(TrelloList $list, array $payload): Card
    {
        return $list->cards()->create($payload);
    }

    public function findOrFail(string $cardId): Card
    {
        return Card::query()->with([
            'list.board.workspace',
            'assignees:id,name,email',
            'labels',
            'comments.user:id,name,email',
            'attachments',
            'activities.user:id,name,email',
        ])->findOrFail($cardId);
    }

    public function syncPositions(array $cardsByList): void
    {
        foreach ($cardsByList as $listId => $cardIds) {
            foreach ($cardIds as $position => $cardId) {
                Card::query()->whereKey($cardId)->update([
                    'list_id' => $listId,
                    'position' => $position,
                ]);
            }
        }
    }
}
