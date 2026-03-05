<?php

namespace App\Modules\Trello\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReorderCardsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cards_by_list' => ['required', 'array', 'min:1'],
            'cards_by_list.*' => ['array'],
            'cards_by_list.*.*' => ['required', 'uuid', 'exists:cards,id'],
        ];
    }
}
