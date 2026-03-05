<?php

namespace App\Modules\Trello\Policies;

use App\Models\User;
use App\Modules\Trello\Models\Workspace;

class WorkspacePolicy
{
    public function view(User $user, Workspace $workspace): bool
    {
        return $workspace->members()->where('users.id', $user->id)->exists();
    }

    public function manage(User $user, Workspace $workspace): bool
    {
        return $workspace->memberships()
            ->where('user_id', $user->id)
            ->whereIn('role', ['owner', 'admin'])
            ->exists();
    }
}
