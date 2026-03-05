<?php

namespace App\Modules\Trello\Repositories;

use App\Modules\Trello\Models\Workspace;
use Illuminate\Database\Eloquent\Collection;

class WorkspaceRepository
{
    public function forUser(string $userId): Collection
    {
        return Workspace::query()
            ->whereHas('members', fn ($q) => $q->where('users.id', $userId))
            ->with(['owner:id,name,email'])
            ->latest()
            ->get();
    }

    public function create(array $payload): Workspace
    {
        return Workspace::query()->create($payload);
    }

    public function findOrFail(string $workspaceId): Workspace
    {
        return Workspace::query()->with(['members:id,name,email'])->findOrFail($workspaceId);
    }
}
