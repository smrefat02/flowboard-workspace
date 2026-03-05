<?php

namespace App\Modules\Trello\Models;

use App\Models\User;
use App\Modules\Trello\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CardAttachment extends Model
{
    use HasUuidPrimaryKey;

    protected $fillable = [
        'card_id',
        'uploaded_by',
        'file_name',
        'file_path',
        'mime_type',
        'size_bytes',
    ];

    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
