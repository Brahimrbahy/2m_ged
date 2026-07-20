import { router } from '@inertiajs/react';
import type { ActivityItem as ActivityItemType } from '@/types';

const typeIcons: Record<string, string> = {
    document_uploaded: '📄',
    document_deleted: '🗑️',
    document_shared: '🔗',
    member_added: '👤',
    member_removed: '👋',
};

function timeAgo(dateString: string): string {
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

interface ActivityItemProps {
    activity: ActivityItemType;
}

export default function ActivityItem({ activity }: ActivityItemProps) {
    function handleClick() {
        if (activity.subject_type?.includes('Document') && activity.subject_id) {
            router.get(`/documents/${activity.subject_id}`);
        } else if (activity.subject_type?.includes('Space') && activity.subject_id) {
            router.get(`/spaces/${activity.subject_id}`);
        }
    }

    const icon = typeIcons[activity.type] || '📌';
    const hasLink = activity.subject_type && activity.subject_id;

    return (
        <button
            onClick={handleClick}
            disabled={!hasLink}
            className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-default disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
        >
            <span className="mt-0.5 text-lg">{icon}</span>
            <div className="min-w-0 flex-1">
                <p className="text-sm">
                    <span className="font-medium">{activity.user.name}</span>{' '}
                    <span className="text-muted-foreground">{activity.description}</span>
                </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground/70">
                {timeAgo(activity.created_at)}
            </span>
        </button>
    );
}
