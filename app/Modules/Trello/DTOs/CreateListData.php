<?php

namespace App\Modules\Trello\DTOs;

class CreateListData
{
    public function __construct(public readonly string $title)
    {
    }

    public function toArray(int $position): array
    {
        return [
            'title' => $this->title,
            'position' => $position,
        ];
    }
}
