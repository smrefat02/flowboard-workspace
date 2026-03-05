<?php

namespace App\Modules\Trello\Repositories;

use App\Modules\Trello\Models\Board;
use App\Modules\Trello\Models\Workspace;
use Illuminate\Database\Eloquent\Collection;

class BoardRepository
{
    public function forWorkspace(string $workspaceId): Collection
    {
        return Board::query()
            ->where('workspace_id', $workspaceId)
            ->withCount('lists')
            ->orderBy('position')
            ->get();
    }

    public function create(Workspace $workspace, array $payload): Board
    {
        return $workspace->boards()->create($payload);
    }

    public function findWithBoardTree(string $boardId): Board
    {
        return Board::query()->with([
            'workspace.members:id,name,email',
            'members:id,name,email',
            'labels',
            'lists.cards.assignees:id,name,email',
            'lists.cards.labels',
            'lists.cards.comments.user:id,name,email',
            'activities.user:id,name,email',
        ])->findOrFail($boardId);
    }

    public function findOrFail(string $boardId): Board
    {
        return Board::query()->findOrFail($boardId);
    }
}
