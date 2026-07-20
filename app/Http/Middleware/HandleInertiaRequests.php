<?php

namespace App\Http\Middleware;

use App\Models\Notification as NotificationModel;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'full_name' => $request->user()->full_name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'department' => $request->user()->department,
                    'status' => $request->user()->status,
                    'avatar' => $request->user()->avatar ?? null,
                    'created_at' => $request->user()->created_at,
                    'updated_at' => $request->user()->updated_at,
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'notifications' => [
                'unread_count' => $request->user()
                    ? NotificationModel::forUser($request->user()->id)->unread()->count()
                    : 0,
            ],
        ];
    }
}
