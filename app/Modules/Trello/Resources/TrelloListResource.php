<?php

namespace App\Modules\Trello\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrelloListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'position' => $this->position,
            'cards' => CardResource::collection($this->whenLoaded('cards')),
        ];
    }
}
