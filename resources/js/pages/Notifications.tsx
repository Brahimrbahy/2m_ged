import { Head, router } from '@inertiajs/react';
import { Bell, Check, CheckCheck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Notification, PaginatedNotifications } from '@/types';
import type { PageProps } from '@inertiajs/core';

type NotificationsPageProps = PageProps & {
    notifications: PaginatedNotifications;
    unreadCount: number;
};

export default function Notifications({
    notifications,
    unreadCount,
}: NotificationsPageProps) {
    async function markAsRead(notification: Notification) {
        if (!notification.is_read) {
            await fetch(`/notifications/${notification.id}/read`, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
        }
        if (notification.action_url) {
            router.get(notification.action_url);
        }
    }

    async function markAllAsRead() {
        await fetch('/notifications/read-all', {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
        });
        router.reload({ only: ['notifications', 'unreadCount'] });
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHr = Math.floor(diffMs / 3600000);
        const diffDay = Math.floor(diffMs / 86400000);

        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHr < 24) return `${diffHr}h ago`;
        if (diffDay < 7) return `${diffDay}d ago`;
        return date.toLocaleDateString();
    }

    return (
        <>
            <Head title="Notifications" />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Notifications</h1>
                        <p className="text-sm text-muted-foreground">
                            {unreadCount > 0
                                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                                : 'All caught up'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={markAllAsRead}
                        >
                            <CheckCheck className="mr-1.5 h-4 w-4" />
                            Mark all read
                        </Button>
                    )}
                </div>

                {notifications.data.length === 0 ? (
                    <div className="rounded-lg border bg-white p-12 text-center dark:bg-slate-900">
                        <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">
                            No notifications
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            You'll be notified when something happens in your
                            spaces.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.data.map((notification) => (
                            <button
                                key={notification.id}
                                onClick={() => markAsRead(notification)}
                                className={`flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                                    !notification.is_read
                                        ? 'border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/20'
                                        : 'bg-white dark:bg-slate-900'
                                }`}
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                    {notification.type ===
                                    'document_uploaded' ? (
                                        <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                    ) : (
                                        <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p
                                            className={`text-sm ${!notification.is_read ? 'font-semibold' : 'font-medium'}`}
                                        >
                                            {notification.title}
                                        </p>
                                        {!notification.is_read && (
                                            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                        {notification.message}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground/70">
                                        {formatDate(notification.created_at)}
                                    </p>
                                </div>
                                <div className="shrink-0 pt-0.5">
                                    {notification.is_read ? (
                                        <CheckCheck className="h-4 w-4 text-muted-foreground/50" />
                                    ) : (
                                        <Check className="h-4 w-4 text-blue-500" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {notifications.last_page > 1 && (
                    <div className="flex justify-center gap-2 pt-4">
                        {Array.from(
                            { length: notifications.last_page },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <Button
                                key={page}
                                variant={
                                    page === notifications.current_page
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                    router.get(`/notifications?page=${page}`)
                                }
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
