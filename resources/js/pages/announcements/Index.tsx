import { router, Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';
import AnnouncementCard from '@/components/announcement-card';
import type { Announcement, PaginatedAnnouncements } from '@/types';

type Props = {
    announcements: PaginatedAnnouncements;
};

export default function AnnouncementsIndex({ announcements }: Props) {
    return (
        <>
            <Head title="Announcements" />
            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                            <Megaphone className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Announcements</h1>
                            <p className="text-sm text-muted-foreground">Latest updates and news</p>
                        </div>
                    </div>
                    <Button onClick={() => router.visit('/announcements/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Announcement
                    </Button>
                </div>

                {announcements.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                <Megaphone className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No announcements yet</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Check back later for updates and news.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="space-y-3">
                            {announcements.data.map((announcement: Announcement) => (
                                <AnnouncementCard key={announcement.id} announcement={announcement} />
                            ))}
                        </div>
                        {announcements.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={announcements.current_page === 1}
                                    onClick={() => router.get(`/announcements?page=${announcements.current_page - 1}`)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {announcements.current_page} of {announcements.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={announcements.current_page === announcements.last_page}
                                    onClick={() => router.get(`/announcements?page=${announcements.current_page + 1}`)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
