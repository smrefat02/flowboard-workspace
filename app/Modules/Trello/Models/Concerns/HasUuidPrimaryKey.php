<?php

namespace App\Modules\Trello\Models\Concerns;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

trait HasUuidPrimaryKey
{
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';
}
