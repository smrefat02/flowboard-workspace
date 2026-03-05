<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Modules\Trello\Models\Card;
use App\Notifications\CardDueSoonNotification;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('trello:notify-due-cards', function () {
    $now = now();
    $window = now()->addDay();

    $cards = Card::query()
        ->whereNotNull('due_date')
        ->whereBetween('due_date', [$now, $window])
        ->with('assignees')
        ->get();

    $sent = 0;
    foreach ($cards as $card) {
        foreach ($card->assignees as $assignee) {
            $assignee->notify(new CardDueSoonNotification($card));
            $sent++;
        }
    }

    $this->info("Sent {$sent} due-date notifications.");
})->purpose('Notify assignees about cards due in the next 24 hours');
