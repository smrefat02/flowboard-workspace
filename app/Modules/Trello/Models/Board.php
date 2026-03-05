<?php

namespace App\Modules\Trello\Models;

use App\Models\User;
use App\Modules\Trello\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Board extends Model
{
    use HasUuidPrimaryKey;

    protected $fillable = [
        'workspace_id',
        'name',
        'description',
        'visibility',
        'position',
        'created_by',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function lists(): HasMany
    {
        return $this->hasMany(TrelloList::class, 'board_id')->orderBy('position');
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(BoardMember::class);
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'board_members')
            ->withPivot(['id', 'role'])
            ->withTimestamps();
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    public function labels(): HasMany
    {
        return $this->hasMany(CardLabel::class);
    }
}
