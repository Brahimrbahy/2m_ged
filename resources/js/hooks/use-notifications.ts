import { useCallback, useEffect, useRef, useState } from 'react';

const notificationSound = typeof Audio !== 'undefined' ? new Audio('/notic.mp3') : null;

function playNotificationSound() {
    if (notificationSound) {
        notificationSound.currentTime = 0;
        notificationSound.play().catch(() => {});
    }
}

export function useNotifications(pollInterval = 30000) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
    const initializedRef = useRef(false);
    const countRef = useRef(0);

    const fetchCount = useCallback(async () => {
        try {
            const res = await fetch('/notifications/unread-count');
            const data = await res.json();
            const newCount: number = data.count;

            if (initializedRef.current && newCount > countRef.current) {
                playNotificationSound();
            }

            countRef.current = newCount;
            setUnreadCount(newCount);
            initializedRef.current = true;
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
