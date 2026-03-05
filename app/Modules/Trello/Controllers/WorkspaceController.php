<?php

namespace App\Modules\Trello\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Trello\DTOs\CreateWorkspaceData;
use App\Modules\Trello\Models\Workspace;
use App\Modules\Trello\Repositories\WorkspaceRepository;
use App\Modules\Trello\Requests\InviteWorkspaceMemberRequest;
use App\Modules\Trello\Requests\StoreWorkspaceRequest;
use App\Modules\Trello\Resources\WorkspaceResource;
use App\Modules\Trello\Services\WorkspaceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkspaceController extends Controller
{
    public function __construct(
        private readonly WorkspaceRepository $workspaces,
        private readonly WorkspaceService $workspaceService,
    ) {
    }

    public function index(Request $request)
    {
        return WorkspaceResource::collection(
            $this->workspaces->forUser((string) $request->user()->id),
        );
    }

    public function store(StoreWorkspaceRequest $request): WorkspaceResource
    {
        $workspace = $this->workspaceService->create(new CreateWorkspaceData(
            name: $request->string('name')->toString(),
            description: $request->string('description')->toString() ?: null,
            ownerId: (string) $request->user()->id,
        ));

        return new WorkspaceResource($workspace->load('owner'));
    }

    public function show(Workspace $workspace): WorkspaceResource
    {
        $this->authorize('view', $workspace);

        return new WorkspaceResource($workspace->load(['owner', 'members']));
    }

    public function invite(InviteWorkspaceMemberRequest $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('manage', $workspace);

        $workspace->memberships()->updateOrCreate(
            ['user_id' => $request->string('user_id')->toString()],
            ['role' => $request->string('role')->toString()],
        );

        return response()->json(['message' => 'Member invited']);
    }
}
