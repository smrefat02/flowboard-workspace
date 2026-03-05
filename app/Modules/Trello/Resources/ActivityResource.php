<?php

namespace App\Modules\Trello\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'meta' => $this->meta,
            'user' => new UserTinyResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
        ];
    }
}
