<?php

namespace App\Modules\Trello\Repositories;

use App\Modules\Trello\Models\Board;
use App\Modules\Trello\Models\TrelloList;

class ListRepository
{
    public function create(Board $board, array $payload): TrelloList
    {
        return $board->lists()->create($payload);
    }

    public function findOrFail(string $listId): TrelloList
    {
        return TrelloList::query()->findOrFail($listId);
    }

    public function syncPositions(array $orderedIds): void
    {
        foreach ($orderedIds as $position => $id) {
            TrelloList::query()->whereKey($id)->update(['position' => $position]);
        }
    }
}
