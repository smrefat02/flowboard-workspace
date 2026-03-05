<?php

namespace App\Modules\Trello\DTOs;

class CreateWorkspaceData
{
    public function __construct(
        public readonly string $name,
        public readonly ?string $description,
        public readonly string $ownerId,
    ) {
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'slug' => str($this->name)->slug()->toString(),
            'description' => $this->description,
            'owner_id' => $this->ownerId,
        ];
    }
}
