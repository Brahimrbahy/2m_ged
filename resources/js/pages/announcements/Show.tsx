import { router, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { ArrowLeft, Trash2, Pin, Clock, FolderOpen } from 'lucide-react';
import type { Announcement } from '@/types';

type Props = {
    announcement: Announcement;
};

function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return (
        date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }) +
        ' at ' +
        date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        })
    );
}

function timeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return formatDateTime(dateString);
}

export default function AnnouncementsShow({ announcement }: Props) {
    const getInitials = useInitials();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
            router.delete(`/announcements/${announcement.id}`);
        }
    };

    return (
        <>
            <Head title={announcement.title} />

            <div className="min-h-screen bg-muted/30">
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back Navigation */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit('/announcements')}
                            className="gap-2 text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Announcements
                        </Button>
                    </div>

                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                            {/* Status Badge - Blue for published */}
                            <Badge
                                className={`px-3 py-1 text-xs font-semibold ${
                                    announcement.status === 'published'
                                        ? 'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                        : announcement.status === 'draft'
                                          ? 'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                                          : 'border-transparent bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                            >
                                {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                            </Badge>

                            {announcement.is_pinned && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                                >
                                    <Pin className="h-3 w-3" />
                                    Pinned
                                </Badge>
                            )}

                            {/* Delete Button - Red */}
                            {announcement.can_edit && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDelete}
                                    className="ml-auto gap-2 transition-all hover:shadow-md"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
                            {announcement.title}
                        </h1>

                        {/* Author Metadata */}
                        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                    <AvatarImage src={announcement.creator.avatar} alt={announcement.creator.name} />
                                    <AvatarFallback className="bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                        {getInitials(announcement.creator.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground">
                                        {announcement.creator.name}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span title={formatDateTime(announcement.created_at)}>
                                            {timeAgo(announcement.created_at)}
                                        </span>
                                        <span className="text-muted-foreground/50">·</span>
                                        <span>{formatDateTime(announcement.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            {announcement.target_space && (
                                <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs">
                                    <FolderOpen className="h-3 w-3" />
                                    <span>{announcement.target_space.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mb-8 h-px bg-border" />

                    {/* Content Box */}
                    <div className="mx-auto max-w-3xl">
                        <div className="rounded-xl border border-border/60 bg-card p-8 shadow-sm transition-shadow hover:shadow-md sm:p-10 lg:p-12">
                            <div
                                className="prose prose-base prose-slate dark:prose-invert max-w-none leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: announcement.content ?? '',
                                }}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
