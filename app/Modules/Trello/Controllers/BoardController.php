<?php

namespace App\Modules\Trello\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Trello\DTOs\CreateBoardData;
use App\Modules\Trello\Models\Board;
use App\Modules\Trello\Models\Workspace;
use App\Modules\Trello\Repositories\BoardRepository;
use App\Modules\Trello\Requests\StoreBoardRequest;
use App\Modules\Trello\Requests\UpdateBoardRequest;
use App\Modules\Trello\Resources\BoardResource;
use App\Modules\Trello\Services\ActivityService;
use App\Modules\Trello\Services\BoardService;
use Illuminate\Http\JsonResponse;

class BoardController extends Controller
{
    public function __construct(
        private readonly BoardRepository $boards,
        private readonly BoardService $boardService,
        private readonly ActivityService $activities,
    ) {
    }

    public function index(Workspace $workspace)
    {
        $this->authorize('view', $workspace);

        return BoardResource::collection($this->boards->forWorkspace($workspace->id));
    }

    public function store(StoreBoardRequest $request): BoardResource
    {
        $workspace = Workspace::query()->findOrFail($request->string('workspace_id')->toString());
        $this->authorize('view', $workspace);

        $board = $this->boardService->create($workspace, new CreateBoardData(
            name: $request->string('name')->toString(),
            description: $request->string('description')->toString() ?: null,
            visibility: $request->string('visibility')->toString(),
            createdBy: (string) $request->user()->id,
        ));

        return new BoardResource($board);
    }

    public function show(Board $board): BoardResource
    {
        $board = $this->boards->findWithBoardTree($board->id);
        $this->authorize('view', $board);

        return new BoardResource($board);
    }

    public function update(UpdateBoardRequest $request, Board $board): BoardResource
    {
        $this->authorize('update', $board);

        $board->update($request->validated());

        $this->activities->log($board, null, (string) $request->user()->id, 'board.updated', [
            'changes' => array_keys($request->validated()),
        ]);

        return new BoardResource($board->refresh());
    }

    public function destroy(Board $board): JsonResponse
    {
        $this->authorize('update', $board);

        $this->activities->log($board, null, (string) request()->user()?->id, 'board.deleted', [
            'name' => $board->name,
        ]);

        $board->delete();

        return response()->json(['message' => 'Board deleted']);
    }
}
