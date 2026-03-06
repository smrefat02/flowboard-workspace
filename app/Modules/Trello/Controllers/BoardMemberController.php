<?php

namespace App\Modules\Trello\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Trello\Models\Board;
use App\Modules\Trello\Requests\InviteBoardMemberRequest;
use App\Modules\Trello\Resources\UserTinyResource;
use App\Modules\Trello\Services\ActivityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BoardMemberController extends Controller
{
    public function __construct(private readonly ActivityService $activities)
    {
    }

    public function index(Board $board)
    {
        $this->authorize('view', $board);

        return UserTinyResource::collection($board->members()->get());
    }

    public function store(InviteBoardMemberRequest $request, Board $board): JsonResponse 
    {
        $this->authorize('update', $board);

        $userId = $request->string('user_id')->toString();

        // User must belong to the parent workspace to be added to the board.
        if (! $board->workspace->members()->where('users.id', $userId)->exists()) {
            return response()->json(['message' => 'User is not a workspace member'], 422);
        }

        $member = $board->memberships()->updateOrCreate(
            ['user_id' => $userId],
            ['role' => $request->string('role')->toString()],
        );

        $this->activities->log($board, null, (string) $request->user()->id, 'board.member.added', [
            'member_user_id' => $userId,
            'role' => $member->role,
        ]);

        return response()->json(['message' => 'Board member upserted'], 201);
    }

    public function destroy(Request $request, Board $board, string $user): JsonResponse
    {
        $this->authorize('update', $board);

        $board->memberships()->where('user_id', $user)->delete();

        $this->activities->log($board, null, (string) $request->user()->id, 'board.member.removed', [
            'member_user_id' => $user,
        ]);

        return response()->json(['message' => 'Board member removed']);
    }
}
