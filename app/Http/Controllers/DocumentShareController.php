<?php

namespace App\Http\Controllers;

use App\Http\Requests\ShareDocumentRequest;
use App\Models\Activity;
use App\Models\Document;
use App\Models\DocumentShare;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class DocumentShareController extends Controller
{
    public function share(ShareDocumentRequest $request, Document $document): JsonResponse
    {
        Gate::authorize('share', $document);

        if ($request->input('shared_with_user_id') === $document->uploaded_by) {
            return response()->json(['message' => 'Cannot share a document with its owner.'], 422);
        }

        $share = DocumentShare::updateOrCreate(
            [
                'document_id' => $document->id,
                'shared_with_user_id' => $request->input('shared_with_user_id'),
            ],
            [
                'permission_level' => $request->input('permission_level'),
                'expires_at' => $request->input('expires_at'),
            ]
        );

        $sharedUser = User::findOrFail($request->input('shared_with_user_id'));
        $sharer = $request->user();

        Notification::create([
            'user_id' => $sharedUser->id,
            'type' => 'document_shared',
            'title' => 'Document shared with you',
            'message' => "{$sharer->name} shared \"{$document->title}\" with you as " . DocumentShare::PERMISSIONS[$share->permission_level] . ".",
            'notifiable_type' => Document::class,
            'notifiable_id' => $document->id,
            'action_url' => "/documents/{$document->id}",
        ]);

        $share->load('sharedWithUser');

        Activity::log(
            $request->user(),
            'document_shared',
            "Shared \"{$document->title}\" with {$sharedUser->name}",
            $document,
        );

        return response()->json([
            'share' => [
                'id' => $share->id,
                'permission_level' => $share->permission_level,
                'permission_label' => DocumentShare::PERMISSIONS[$share->permission_level],
                'expires_at' => $share->expires_at?->toIso8601String(),
                'user' => [
                    'id' => $share->sharedWithUser->id,
                    'name' => $share->sharedWithUser->name,
                    'email' => $share->sharedWithUser->email,
                ],
            ],
        ]);
    }

    public function unshare(Request $request, Document $document, User $user): JsonResponse
    {
        Gate::authorize('share', $document);

        $deleted = DocumentShare::where('document_id', $document->id)
            ->where('shared_with_user_id', $user->id)
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Share not found.'], 404);
        }

        return response()->json(['success' => true]);
    }

    public function getShares(Request $request, Document $document): JsonResponse
    {
        Gate::authorize('view', $document);

        $shares = DocumentShare::where('document_id', $document->id)
            ->with('sharedWithUser:id,name,email')
            ->get()
            ->map(fn (DocumentShare $share) => [
                'id' => $share->id,
                'permission_level' => $share->permission_level,
                'permission_label' => DocumentShare::PERMISSIONS[$share->permission_level],
                'expires_at' => $share->expires_at?->toIso8601String(),
                'has_expired' => $share->hasExpired(),
                'user' => [
                    'id' => $share->sharedWithUser->id,
                    'name' => $share->sharedWithUser->name,
                    'email' => $share->sharedWithUser->email,
                ],
            ]);

        return response()->json(['shares' => $shares]);
    }
}
