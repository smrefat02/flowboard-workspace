<?php

namespace App\Modules\Trello\DTOs;

class CreateBoardData
{
    public function __construct(
        public readonly string $name,
        public readonly ?string $description,
        public readonly string $visibility,
        public readonly string $createdBy,
    ) {
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'visibility' => $this->visibility,
            'created_by' => $this->createdBy,
            'position' => 0,
        ];
    }
}
