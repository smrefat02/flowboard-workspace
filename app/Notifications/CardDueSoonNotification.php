<?php

namespace App\Notifications;

use App\Modules\Trello\Models\Card;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CardDueSoonNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Card $card)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Card due soon: '.$this->card->title)
            ->line('A card assigned to you is due soon.')
            ->line('Card: '.$this->card->title)
            ->line('Due at: '.optional($this->card->due_date)->toDateTimeString())
            ->action('Open Trello Board', url('/'));
    }
}
