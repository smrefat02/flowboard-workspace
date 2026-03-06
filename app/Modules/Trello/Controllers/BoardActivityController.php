<?php

namespace App\Modules\Trello\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Trello\Models\Board;
use App\Modules\Trello\Resources\ActivityResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BoardActivityController extends Controller
{
    public function __invoke(Request $request, Board $board): AnonymousResourceCollection
    {
        $this->authorize('view', $board);

        $activities = $board->activities()
            ->with('user:id,name,email')
            ->orderByDesc('created_at')
            ->paginate(25);

        return ActivityResource::collection($activities);
    }
}
