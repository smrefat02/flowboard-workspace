<?php

namespace App\Modules\Trello\Services;

use App\Modules\Trello\DTOs\CreateWorkspaceData;
use App\Modules\Trello\Models\Workspace;
use App\Modules\Trello\Repositories\WorkspaceRepository;

class WorkspaceService
{
    public function __construct(private readonly WorkspaceRepository $workspaces)
    {
    }

    public function create(CreateWorkspaceData $data): Workspace
    {
        $workspace = $this->workspaces->create($data->toArray());

        $workspace->memberships()->create([
            'user_id' => $data->ownerId,
            'role' => 'owner',
        ]);

        return $workspace->load('members:id,name,email');
    }
}
