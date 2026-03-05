<?php

namespace App\Modules\Trello\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Trello\Models\Card;
use App\Modules\Trello\Requests\StoreCardCommentRequest;
use App\Modules\Trello\Resources\CardCommentResource;
use App\Modules\Trello\Services\ActivityService;
use Illuminate\Http\JsonResponse;

class CardCommentController extends Controller
{
    public function __construct(private readonly ActivityService $activities)
    {
    }

    public function store(StoreCardCommentRequest $request, Card $card): CardCommentResource
    {
        $this->authorize('comment', $card);

        $comment = $card->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $request->string('body')->toString(),
        ]);

        $this->activities->log($card->list->board, $card, (string) $request->user()->id, 'card.comment.created', [
            'comment_id' => $comment->id,
        ]);

        return new CardCommentResource($comment->load('user'));
    }

    public function destroy(Card $card, string $comment): JsonResponse
    {
        $this->authorize('comment', $card);

        $card->comments()->whereKey($comment)->delete();

        $this->activities->log($card->list->board, $card, (string) request()->user()?->id, 'card.comment.deleted', [
            'comment_id' => $comment,
        ]);

        return response()->json(['message' => 'Comment deleted']);
    }
}
