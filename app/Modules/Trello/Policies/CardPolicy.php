<?php

namespace App\Modules\Trello\Policies;

use App\Models\User;
use App\Modules\Trello\Models\Card;

class CardPolicy
{
    public function view(User $user, Card $card): bool
    {
        return $card->list->board->workspace->members()->where('users.id', $user->id)->exists();
    }

    public function update(User $user, Card $card): bool
    {
        return $card->list->board->members()->where('users.id', $user->id)->exists();
    }

    public function comment(User $user, Card $card): bool
    {
        return $this->update($user, $card);
    }
}
