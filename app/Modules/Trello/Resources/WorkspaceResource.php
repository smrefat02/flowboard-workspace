<?php

namespace App\Modules\Trello\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkspaceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'owner' => new UserTinyResource($this->whenLoaded('owner')),
            'members' => UserTinyResource::collection($this->whenLoaded('members')),
            'created_at' => $this->created_at,
        ];
    }
}
