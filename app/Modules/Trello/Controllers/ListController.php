<?php

namespace App\Modules\Trello\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Trello\DTOs\CreateListData;
use App\Modules\Trello\Models\Board;
use App\Modules\Trello\Models\TrelloList;
use App\Modules\Trello\Requests\ReorderListsRequest;
use App\Modules\Trello\Requests\StoreListRequest;
use App\Modules\Trello\Resources\CardResource;
use App\Modules\Trello\Resources\TrelloListResource;
use App\Modules\Trello\Services\ActivityService;
use App\Modules\Trello\Services\ListService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ListController extends Controller
{
    public function __construct(
        private readonly ListService $lists,
        private readonly ActivityService $activities,
    )
    {
    }

    public function cards(TrelloList $list): AnonymousResourceCollection
    {
        $this->authorize('view', $list->board);

        $cards = $list->cards()
            ->with(['assignees:id,name,email', 'labels'])
            ->get();

        return CardResource::collection($cards);
    }

    public function store(StoreListRequest $request, Board $board): TrelloListResource
    {
        $this->authorize('update', $board);

        $list = $this->lists->create($board, new CreateListData(
            title: $request->string('title')->toString(),
        ));

        $this->activities->log($board, null, (string) $request->user()->id, 'list.created', [
            'list_id' => $list->id,
            'title' => $list->title,
        ]);

        return new TrelloListResource($list);
    }

    public function update(StoreListRequest $request, TrelloList $list): TrelloListResource
    {
        $this->authorize('update', $list->board);

        $list->update($request->validated());

        $this->activities->log($list->board, null, (string) $request->user()->id, 'list.updated', [
            'list_id' => $list->id,
            'title' => $list->title,
        ]);

        return new TrelloListResource($list);
    }

    public function reorder(ReorderListsRequest $request, Board $board): JsonResponse
    {
        $this->authorize('update', $board);

        $this->lists->reorder($request->validated('ordered_ids'));

        $this->activities->log($board, null, (string) $request->user()->id, 'list.reordered');

        return response()->json(['message' => 'Lists reordered']);
    }

    public function destroy(TrelloList $list): JsonResponse
    {
        $this->authorize('update', $list->board);

        $this->activities->log($list->board, null, (string) request()->user()?->id, 'list.deleted', [
            'list_id' => $list->id,
            'title' => $list->title,
        ]);

        $list->delete();

        return response()->json(['message' => 'List deleted']);
    }
}
