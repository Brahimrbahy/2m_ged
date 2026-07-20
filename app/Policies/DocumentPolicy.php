<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\DocumentShare;
use App\Models\User;

class DocumentPolicy
{
    public function view(User $user, Document $document): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($document->uploaded_by === $user->id) {
            return true;
        }

        if ($document->space_id && $document->space->created_by === $user->id) {
            return true;
        }

        if ($document->space_id && $document->space->members()->where('user_id', $user->id)->exists()) {
            return true;
        }

        $share = DocumentShare::where('document_id', $document->id)
            ->where('shared_with_user_id', $user->id)
            ->first();

        if ($share && !$share->hasExpired()) {
            return true;
        }

        return false;
    }

    public function update(User $user, Document $document): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($document->uploaded_by === $user->id) {
            return true;
        }

        if ($document->space_id && $document->space->created_by === $user->id) {
            return true;
        }

        $share = DocumentShare::where('document_id', $document->id)
            ->where('shared_with_user_id', $user->id)
            ->first();

        if ($share && !$share->hasExpired() && $share->hasPermission('can_edit')) {
            return true;
        }

        return false;
    }

    public function delete(User $user, Document $document): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($document->uploaded_by === $user->id) {
            return true;
        }

        if ($document->space_id && $document->space->created_by === $user->id) {
            return true;
        }

        $share = DocumentShare::where('document_id', $document->id)
            ->where('shared_with_user_id', $user->id)
            ->first();

        if ($share && !$share->hasExpired() && $share->hasPermission('can_delete')) {
            return true;
        }

        return false;
    }

    public function share(User $user, Document $document): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $document->uploaded_by === $user->id;
    }
}
