<?php

namespace App\Modules\Trello\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
        ];
    }
}
