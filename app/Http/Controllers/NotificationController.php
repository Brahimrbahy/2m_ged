<?php

namespace App\Http\Controllers;

use App\Models\Notification as NotificationModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $notifications = NotificationModel::forUser($user->id)
            ->latest()
            ->paginate(20)
            ->through(fn (NotificationModel $notification) => [
                'id' => $notification->id,
                'type' => $notification->type,
                'title' => $notification->title,
                'message' => $notification->message,
                'action_url' => $notification->action_url,
                'is_read' => $notification->is_read,
                'read_at' => $notification->read_at?->toIso8601String(),
                'created_at' => $notification->created_at->toIso8601String(),
            ]);

        $unreadCount = NotificationModel::forUser($user->id)->unread()->count();

        return Inertia::render('Notifications', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = NotificationModel::forUser($request->user()->id)->unread()->count();

        return response()->json(['count' => $count]);
    }

    public function recent(Request $request): JsonResponse
    {
        $notifications = NotificationModel::forUser($request->user()->id)
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (NotificationModel $notification) => [
                'id' => $notification->id,
                'type' => $notification->type,
                'title' => $notification->title,
                'message' => $notification->message,
                'action_url' => $notification->action_url,
                'is_read' => $notification->is_read,
                'read_at' => $notification->read_at?->toIso8601String(),
                'created_at' => $notification->created_at->toIso8601String(),
            ]);

        return response()->json(['notifications' => $notifications]);
    }

    public function markAsRead(Request $request, NotificationModel $notification): JsonResponse|RedirectResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $notification->markAsRead();

        if ($request->header('X-Inertia')) {
            return back();
        }

        return response()->json(['success' => true]);
    }

    public function markAllAsRead(Request $request): JsonResponse|RedirectResponse
    {
        NotificationModel::forUser($request->user()->id)
            ->unread()
            ->update(['is_read' => true, 'read_at' => now()]);

        if ($request->header('X-Inertia')) {
            return back();
        }

        return response()->json(['success' => true]);
    }
}
