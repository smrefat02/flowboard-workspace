<?php

namespace App\Modules\Trello\Services;

use App\Modules\Trello\DTOs\CreateBoardData;
use App\Modules\Trello\Models\Board;
use App\Modules\Trello\Models\Workspace;
use App\Modules\Trello\Repositories\BoardRepository;

class BoardService
{
    public function __construct(
        private readonly BoardRepository $boards,
        private readonly ActivityService $activities,
    ) {
    }

    public function create(Workspace $workspace, CreateBoardData $data): Board
    {
        $position = $workspace->boards()->count();

        $board = $this->boards->create($workspace, [
            ...$data->toArray(),
            'position' => $position,
        ]);

        $board->memberships()->create([
            'user_id' => $data->createdBy,
            'role' => 'owner',
        ]);

        $this->activities->log($board, null, $data->createdBy, 'board.created', [
            'name' => $board->name,
        ]);

        return $board;
    }
}
