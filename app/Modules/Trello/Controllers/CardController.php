<?php

namespace App\Modules\Trello\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Trello\DTOs\CreateCardData;
use App\Modules\Trello\Models\Card;
use App\Modules\Trello\Models\TrelloList;
use App\Modules\Trello\Requests\ReorderCardsRequest;
use App\Modules\Trello\Requests\StoreCardRequest;
use App\Modules\Trello\Requests\UpdateCardRequest;
use App\Modules\Trello\Resources\CardResource;
use App\Modules\Trello\Services\ActivityService;
use App\Modules\Trello\Services\CardService;
use Illuminate\Http\JsonResponse;

class CardController extends Controller
{
    public function __construct(
        private readonly CardService $cards,
        private readonly ActivityService $activities,
    )
    {
    }

    public function store(StoreCardRequest $request, TrelloList $list): CardResource
    {
        $this->authorize('modifyCards', $list->board);

        $card = $this->cards->create($list, new CreateCardData(
            title: $request->string('title')->toString(),
            description: $request->string('description')->toString() ?: null,
            dueDate: $request->string('due_date')->toString() ?: null,
            creatorId: (string) $request->user()->id,
        ));

        return new CardResource($card->load(['assignees', 'labels']));
    }

    public function show(Card $card): CardResource
    {
        $this->authorize('view', $card);

        return new CardResource($card->load(['assignees', 'labels', 'comments.user', 'attachments', 'activities.user']));
    }

    public function update(UpdateCardRequest $request, Card $card): CardResource
    {
        $this->authorize('update', $card);

        $changes = array_keys($request->validated());
        $card->update($request->safe()->except(['assignee_ids', 'label_ids']));

        if ($request->has('assignee_ids')) {
            $card->assignees()->sync($request->validated('assignee_ids'));
        }

        if ($request->has('label_ids')) {
            $card->labels()->sync($request->validated('label_ids'));
        }

        $this->activities->log($card->list->board, $card, (string) $request->user()->id, 'card.updated', [
            'changes' => $changes,
        ]);

        return new CardResource($card->refresh()->load(['assignees', 'labels']));
    }

    public function reorder(ReorderCardsRequest $request): JsonResponse
    {
        $firstListId = array_key_first($request->validated('cards_by_list'));
        $list = TrelloList::query()->findOrFail($firstListId);
        $this->authorize('modifyCards', $list->board);

        $this->cards->reorder($request->validated('cards_by_list'), (string) $request->user()->id);

        return response()->json(['message' => 'Cards reordered']);
    }

    public function destroy(Card $card): JsonResponse
    {
        $this->authorize('update', $card);

        $this->activities->log($card->list->board, $card, (string) request()->user()?->id, 'card.deleted', [
            'title' => $card->title,
        ]);

        $card->delete();

        return response()->json(['message' => 'Card deleted']);
    }
}
