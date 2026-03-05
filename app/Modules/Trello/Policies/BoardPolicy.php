<?php

namespace App\Modules\Trello\Policies;

use App\Models\User;
use App\Modules\Trello\Models\Board;

class BoardPolicy
{
    public function view(User $user, Board $board): bool
    {
        return $board->workspace->members()->where('users.id', $user->id)->exists();
    }

    public function update(User $user, Board $board): bool
    {
        return $board->memberships()
            ->where('user_id', $user->id)
            ->whereIn('role', ['owner', 'admin'])
            ->exists();
    }

    public function modifyCards(User $user, Board $board): bool
    {
        return $board->members()->where('users.id', $user->id)->exists();
    }
}
