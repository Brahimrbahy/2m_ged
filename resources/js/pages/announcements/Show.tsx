import { router, Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pin, Trash2 } from 'lucide-react';
import { UserInfo } from '@/components/user-info';
import type { Announcement } from '@/types';

type Props = {
    announcement: Announcement;
};

function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }) + ' at ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });
}

export default function AnnouncementsShow({ announcement }: Props) {
    const handleDelete = () => {
        if (confirm('Delete this announcement?')) {
            router.delete(`/announcements/${announcement.id}`);
        }
    };

    return (
        <>
            <Head title={announcement.title} />
            <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            {announcement.is_pinned && (
                                <Pin className="h-4 w-4 text-amber-500" />
                            )}
                            {announcement.is_pinned && (
                                <Badge
                                    variant="secondary"
                                    className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                                >
                                    Pinned
                                </Badge>
                            )}
                            <Badge
                                variant={
                                    announcement.status === 'published'
                                        ? 'default'
                                        : 'outline'
                                }
                            >
                                {announcement.status}
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold">
                            {announcement.title}
                        </h1>
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                            <UserInfo user={announcement.creator} />
                            <span>{formatDateTime(announcement.created_at)}</span>
                            {announcement.target_space && (
                                <span>in {announcement.target_space.name}</span>
                            )}
                        </div>
                    </div>
                    {announcement.can_edit && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                        >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                        </Button>
                    )}
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div
                            className="prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{
                                __html: announcement.content ?? '',
                            }}
                        />
                    </CardContent>
                </Card>

                <div className="mt-6">
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/announcements')}
                    >
                        Back to Announcements
                    </Button>
                </div>
            </div>
        </>
    );
}
