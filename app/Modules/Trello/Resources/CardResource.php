<?php

namespace App\Modules\Trello\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'due_date' => $this->due_date,
            'checklist' => $this->checklist ?? [],
            'position' => $this->position,
            'archived_at' => $this->archived_at,
            'assignees' => UserTinyResource::collection($this->whenLoaded('assignees')),
            'labels' => $this->whenLoaded('labels', fn () => $this->labels->map(fn ($label) => [
                'id' => $label->id,
                'name' => $label->name,
                'color' => $label->color,
            ])),
            'comments' => CardCommentResource::collection($this->whenLoaded('comments')),
            'attachments' => $this->whenLoaded('attachments', fn () => $this->attachments->map(fn ($attachment) => [
                'id' => $attachment->id,
                'file_name' => $attachment->file_name,
                'file_path' => $attachment->file_path,
                'url' => \Illuminate\Support\Facades\Storage::disk('public')->url($attachment->file_path),
                'mime_type' => $attachment->mime_type,
                'size_bytes' => $attachment->size_bytes,
            ])),
            'activities' => ActivityResource::collection($this->whenLoaded('activities')),
        ];
    }
}
