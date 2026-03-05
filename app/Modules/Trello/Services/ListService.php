<?php

namespace App\Modules\Trello\Services;

use App\Modules\Trello\DTOs\CreateListData;
use App\Modules\Trello\Models\Board;
use App\Modules\Trello\Models\TrelloList;
use App\Modules\Trello\Repositories\ListRepository;

class ListService
{
    public function __construct(private readonly ListRepository $lists)
    {
    }

    public function create(Board $board, CreateListData $data): TrelloList
    {
        return $this->lists->create($board, $data->toArray($board->lists()->count()));
    }

    public function reorder(array $orderedIds): void
    {
        $this->lists->syncPositions($orderedIds);
    }
}
