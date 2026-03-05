<?php

namespace App\Modules\Trello\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReorderListsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ordered_ids' => ['required', 'array', 'min:1'],
            'ordered_ids.*' => ['required', 'uuid', 'exists:lists,id'],
        ];
    }
}
