<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShareDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shared_with_user_id' => ['required', 'exists:users,id'],
            'permission_level' => ['required', 'in:view_only,can_comment,can_edit,can_delete'],
            'expires_at' => ['nullable', 'date', 'after:today'],
        ];
    }
}
