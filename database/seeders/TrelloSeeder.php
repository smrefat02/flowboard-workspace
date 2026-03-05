<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Trello\Models\Board;
use App\Modules\Trello\Models\Card;
use App\Modules\Trello\Models\TrelloList;
use App\Modules\Trello\Models\Workspace;
use Illuminate\Database\Seeder;

class TrelloSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::query()->firstOrCreate(
            ['email' => 'owner@example.com'],
            ['name' => 'Owner User', 'password' => bcrypt('password')],
        );

        $workspace = Workspace::query()->firstOrCreate(
            ['slug' => 'acme-workspace'],
            [
                'name' => 'Acme Workspace',
                'description' => 'Demo workspace for Trello module',
                'owner_id' => $owner->id,
            ],
        );

        $workspace->memberships()->firstOrCreate(
            ['user_id' => $owner->id],
            ['role' => 'owner'],
        );

        $board = Board::query()->firstOrCreate(
            [
                'workspace_id' => $workspace->id,
                'name' => 'Launch Board',
            ],
            [
                'created_by' => $owner->id,
                'description' => 'Roadmap and release coordination',
                'visibility' => 'workspace',
                'position' => 0,
            ],
        );

        $board->memberships()->firstOrCreate(
            ['user_id' => $owner->id],
            ['role' => 'owner'],
        );

        $todo = TrelloList::query()->firstOrCreate(
            ['board_id' => $board->id, 'title' => 'To Do'],
            ['position' => 0],
        );
        $doing = TrelloList::query()->firstOrCreate(
            ['board_id' => $board->id, 'title' => 'Doing'],
            ['position' => 1],
        );

        Card::query()->firstOrCreate(
            [
                'list_id' => $todo->id,
                'title' => 'Create onboarding flow',
            ],
            [
                'creator_id' => $owner->id,
                'description' => 'Ship the first version of onboarding.',
                'position' => 0,
            ],
        );

        Card::query()->firstOrCreate(
            [
                'list_id' => $doing->id,
                'title' => 'Finalize API docs',
            ],
            [
                'creator_id' => $owner->id,
                'description' => 'Add examples and policy details.',
                'position' => 0,
            ],
        );
    }
}
