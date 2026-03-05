<?php

namespace App\Modules\Trello\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCardCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:5000'],
        ];
    }
}
