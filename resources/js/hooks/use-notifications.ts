import { useCallback, useEffect, useRef, useState } from 'react';

export function useNotifications(pollInterval = 30000) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

    const fetchCount = useCallback(async () => {
        try {
            const res = await fetch('/notifications/unread-count');
            const data = await res.json();
            setUnreadCount(data.count);
        } catch {
            // silently fail
        }
    }, []);

    const markAsRead = useCallback(async (notificationId: number) => {
        try {
            await fetch(`/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch {
            // silently fail
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        setLoading(true);
        try {
            await fetch('/notifications/read-all', {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            setUnreadCount(0);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCount();
        intervalRef.current = setInterval(fetchCount, pollInterval);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchCount, pollInterval]);

    return { unreadCount, loading, markAsRead, markAllAsRead, refresh: fetchCount };
}
