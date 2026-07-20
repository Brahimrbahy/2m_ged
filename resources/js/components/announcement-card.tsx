import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pin } from 'lucide-react';
import type { Announcement } from '@/types';

interface AnnouncementCardProps {
    announcement: Announcement;
}

function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffDay < 1) return 'Today';
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay} days ago`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)} weeks ago`;
    return date.toLocaleDateString();
}

export default function AnnouncementCard({
    announcement,
}: AnnouncementCardProps) {
    return (
        <Card
            className={`cursor-pointer transition-shadow hover:shadow-md ${
                announcement.is_pinned
                    ? 'border-l-4 border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/10'
                    : ''
            }`}
            onClick={() => router.get(`/announcements/${announcement.id}`)}
        >
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                        {announcement.is_pinned && (
                            <Pin className="h-4 w-4 shrink-0 text-amber-500" />
                        )}
                        <CardTitle className="truncate text-base">
                            {announcement.title}
                        </CardTitle>
                    </div>
                    {announcement.is_pinned && (
                        <Badge
                            variant="secondary"
                            className="shrink-0 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                        >
                            Pinned
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                    {announcement.excerpt}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>by {announcement.creator.name}</span>
                    <span>{timeAgo(announcement.created_at)}</span>
                    {announcement.target_space && (
                        <span>in {announcement.target_space.name}</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
