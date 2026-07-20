<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'target_space_id' => ['nullable', 'exists:spaces,id'],
            'is_pinned' => ['boolean'],
            'status' => ['in:draft,published'],
        ];
    }
}
