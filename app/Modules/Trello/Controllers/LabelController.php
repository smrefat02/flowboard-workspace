<?php

namespace App\Modules\Trello\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Trello\Models\Board;
use App\Modules\Trello\Models\CardLabel;
use App\Modules\Trello\Requests\StoreLabelRequest;
use App\Modules\Trello\Services\ActivityService;
use Illuminate\Http\JsonResponse;

class LabelController extends Controller
{
    public function __construct(private readonly ActivityService $activities)
    {
    }

    public function store(StoreLabelRequest $request, Board $board): JsonResponse
    {
        $this->authorize('modifyCards', $board);

        $label = $board->labels()->create($request->validated());

        $this->activities->log($board, null, (string) $request->user()->id, 'label.created', [
            'label_id' => $label->id,
            'name' => $label->name,
        ]);

        return response()->json(['data' => $label], 201);
    }

    public function update(StoreLabelRequest $request, CardLabel $label): JsonResponse
    {
        $this->authorize('modifyCards', $label->board);

        $label->update($request->validated());

        $this->activities->log($label->board, null, (string) $request->user()->id, 'label.updated', [
            'label_id' => $label->id,
            'name' => $label->name,
        ]);

        return response()->json(['data' => $label]);
    }

    public function destroy(CardLabel $label): JsonResponse
    {
        $this->authorize('modifyCards', $label->board);

        $this->activities->log($label->board, null, (string) request()->user()?->id, 'label.deleted', [
            'label_id' => $label->id,
            'name' => $label->name,
        ]);

        $label->delete();

        return response()->json(['message' => 'Label deleted']);
    }
}
