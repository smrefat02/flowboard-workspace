<?php

namespace App\Modules\Trello\Models;

use App\Models\User;
use App\Modules\Trello\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Card extends Model
{
    use HasUuidPrimaryKey;

    protected $fillable = [
        'list_id',
        'creator_id',
        'title',
        'description',
        'due_date',
        'checklist',
        'position',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'datetime',
            'archived_at' => 'datetime',
            'checklist' => 'array',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNull('archived_at');
    }

    public function scopeArchived(Builder $query): Builder
    {
        return $query->whereNotNull('archived_at');
    }

    public function isArchived(): bool
    {
        return $this->archived_at !== null;
    }

    public function list(): BelongsTo
    {
        return $this->belongsTo(TrelloList::class, 'list_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function assignees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'card_assignees')->withTimestamps();
    }

    public function comments(): HasMany
    {
        return $this->hasMany(CardComment::class);
    }

    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(CardLabel::class, 'card_label_links')->withTimestamps();
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(CardAttachment::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }
}
