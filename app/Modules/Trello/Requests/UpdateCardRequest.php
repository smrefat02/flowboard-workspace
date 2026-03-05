<?php

namespace App\Modules\Trello\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'checklist' => ['sometimes', 'array'],
            'checklist.*.id' => ['required_with:checklist', 'string', 'max:100'],
            'checklist.*.title' => ['required_with:checklist', 'string', 'max:200'],
            'checklist.*.date' => ['nullable', 'date_format:Y-m-d'],
            'checklist.*.items' => ['required_with:checklist', 'array'],
            'checklist.*.items.*.id' => ['required_with:checklist.*.items', 'string', 'max:100'],
            'checklist.*.items.*.text' => ['required_with:checklist.*.items', 'string', 'max:500'],
            'checklist.*.items.*.completed' => ['required_with:checklist.*.items', 'boolean'],
            'assignee_ids' => ['sometimes', 'array'],
            'assignee_ids.*' => ['uuid', 'exists:users,id'],
            'label_ids' => ['sometimes', 'array'],
            'label_ids.*' => ['uuid', 'exists:card_labels,id'],
        ];
    }
}
