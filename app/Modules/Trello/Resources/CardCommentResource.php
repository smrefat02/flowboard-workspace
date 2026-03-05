<?php

namespace App\Modules\Trello\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CardCommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'user' => new UserTinyResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
        ];
    }
}
