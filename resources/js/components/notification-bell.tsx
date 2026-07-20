import { router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Notification } from '@/types';

type NotificationBellProps = {
    unreadCount: number;
    onMarkAsRead: (id: number) => void;
    onMarkAllAsRead: () => void;
};

export default function NotificationBell({
    unreadCount,
    onMarkAsRead,
    onMarkAllAsRead,
}: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const fetchRecent = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/notifications/recent');
            const data = await res.json();
            setNotifications(data.notifications || []);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, []);

    function handleToggle() {
        const next = !isOpen;
        setIsOpen(next);
        if (next) {
            fetchRecent();
        }
    }

    function handleNotificationClick(notification: Notification) {
        if (!notification.is_read) {
            onMarkAsRead(notification.id);
        }
        setIsOpen(false);
        if (notification.action_url) {
            router.get(notification.action_url);
        }
    }

    function handleViewAll() {
        setIsOpen(false);
        router.get('/notifications');
    }

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9"
                onClick={handleToggle}
            >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute top-full right-0 z-50 mt-1 w-80 overflow-hidden rounded-lg border bg-white shadow-lg dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b px-4 py-2.5">
                        <span className="text-sm font-semibold">
                            Notifications
                        </span>
                        {unreadCount > 0 && (
                            <button
                                onClick={onMarkAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                            No notifications yet.
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                    className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${
                                        !notification.is_read
                                            ? 'bg-blue-50/50 dark:bg-blue-950/20'
                                            : ''
                                    }`}
                                >
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className={`text-sm ${!notification.is_read ? 'font-medium' : ''}`}
                                        >
                                            {notification.title}
                                        </p>
                                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                            {notification.message}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleViewAll}
                        className="w-full border-t px-4 py-2.5 text-center text-sm font-medium text-blue-600 hover:bg-slate-50 dark:text-blue-400 dark:hover:bg-slate-800"
                    >
                        View all notifications
                    </button>
                </div>
            )}
        </div>
    );
}
