<?php

namespace App\Modules\Trello\Services;

use App\Modules\Trello\DTOs\CreateCardData;
use App\Modules\Trello\Models\Card;
use App\Modules\Trello\Models\TrelloList;
use App\Modules\Trello\Repositories\CardRepository;

class CardService
{
    public function __construct(
        private readonly CardRepository $cards,
        private readonly ActivityService $activities,
    ) {
    }

    public function create(TrelloList $list, CreateCardData $data): Card
    {
        $card = $this->cards->create($list, $data->toArray($list->cards()->count()));

        $this->activities->log($list->board, $card, $data->creatorId, 'card.created', [
            'title' => $card->title,
            'list_id' => $list->id,
        ]);

        return $card;
    }

    public function reorder(array $cardsByList, ?string $userId = null): void
    {
        $this->cards->syncPositions($cardsByList);

        $firstCardId = collect($cardsByList)->flatten()->first();
        if (! $firstCardId) {
            return;
        }

        $card = $this->cards->findOrFail($firstCardId);
        $this->activities->log($card->list->board, $card, $userId, 'card.reordered');
    }
}
