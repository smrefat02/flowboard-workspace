<?php

namespace App\Modules\Trello\Services;

use App\Modules\Trello\Models\Activity;
use App\Modules\Trello\Models\Board;
use App\Modules\Trello\Models\Card;

class ActivityService
{
    public function log(Board $board, ?Card $card, ?string $userId, string $action, array $meta = []): Activity
    {
        return Activity::query()->create([
            'board_id' => $board->id,
            'card_id' => $card?->id,
            'user_id' => $userId,
            'action' => $action,
            'meta' => $meta,
        ]);
    }
}
