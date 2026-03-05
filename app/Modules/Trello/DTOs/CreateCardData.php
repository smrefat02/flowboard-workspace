<?php

namespace App\Modules\Trello\DTOs;

class CreateCardData
{
    public function __construct(
        public readonly string $title,
        public readonly ?string $description,
        public readonly ?string $dueDate,
        public readonly string $creatorId,
    ) {
    }

    public function toArray(int $position): array
    {
        return [
            'title' => $this->title,
            'description' => $this->description,
            'due_date' => $this->dueDate,
            'creator_id' => $this->creatorId,
            'position' => $position,
        ];
    }
}
