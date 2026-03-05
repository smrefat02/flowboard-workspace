<?php

namespace App\Modules\Trello;

use App\Modules\Trello\Models\Board;
use App\Modules\Trello\Models\Card;
use App\Modules\Trello\Models\Workspace;
use App\Modules\Trello\Policies\BoardPolicy;
use App\Modules\Trello\Policies\CardPolicy;
use App\Modules\Trello\Policies\WorkspacePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class TrelloServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/Migrations');

        Gate::policy(Workspace::class, WorkspacePolicy::class);
        Gate::policy(Board::class, BoardPolicy::class);
        Gate::policy(Card::class, CardPolicy::class);
    }
}
