import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Folder, Users, Link, Pin } from 'lucide-react';
import StatCard from '@/components/stat-card';
import DocumentCard from '@/components/document-card';
import ActivityItem from '@/components/activity-item';
import type { DashboardStats, ActivityItem as ActivityItemType, Announcement, Document, User } from '@/types';
import type { PageProps } from '@inertiajs/core';

type DashboardPageProps = PageProps & {
    stats: DashboardStats;
    recentDocuments: Document[];
    activities: ActivityItemType[];
    announcements: Announcement[];
};

export default function Dashboard({ stats, recentDocuments, activities, announcements }: DashboardPageProps) {
    const { auth } = usePage().props;
    const user = auth.user as User;
    const displayName = user?.full_name || user?.name || 'there';

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Welcome back, {displayName}</h1>
                    <p className="text-muted-foreground">
                        Here's an overview of your document management activity.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Your Documents" value={stats.documents} icon={FileText} />
                    <StatCard label="Spaces" value={stats.spaces} icon={Folder} />
                    <StatCard label="Team Members" value={stats.team_members} icon={Users} />
                    <StatCard label="Shared with You" value={stats.shared_documents} icon={Link} />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Recent Documents</h2>
                            <Button variant="ghost" size="sm" onClick={() => router.get('/documents')}>
                                View all →
                            </Button>
                        </div>
                        {recentDocuments.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Folder className="h-10 w-10 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-medium">No documents yet</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Upload your first document to get started.
                                    </p>
                                    <Button className="mt-4" onClick={() => router.get('/documents/create')}>
                                        Upload Document
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {recentDocuments.map((doc) => (
                                    <DocumentCard
                                        key={doc.id}
                                        document={doc}
                                        canShare={doc.can_share as boolean}
                                        sharesCount={doc.shares_count as number}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Recent Activity</h2>
                                <Button variant="ghost" size="sm" onClick={() => router.get('/notifications')}>
                                    View all →
                                </Button>
                            </div>
                            <Card>
                                <CardContent className="p-2">
                                    {activities.length === 0 ? (
                                        <div className="py-8 text-center text-sm text-muted-foreground">
                                            No activity yet.
                                        </div>
                                    ) : (
                                        <div className="divide-y">
                                            {activities.map((activity) => (
                                                <ActivityItem key={activity.id} activity={activity} />
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold mb-4">Announcements</h2>
                            <div className="space-y-3">
                                {announcements.length === 0 ? (
                                    <Card>
                                        <CardContent className="py-8 text-center text-sm text-muted-foreground">
                                            No announcements.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    announcements.map((announcement) => (
                                        <Card key={announcement.id} className={`border-l-4 transition-shadow hover:shadow-md cursor-pointer ${announcement.is_pinned ? 'border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/10' : 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'}`} onClick={() => router.get(`/announcements/${announcement.id}`)}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {announcement.is_pinned && <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase tracking-wider"><Pin className="h-3 w-3" /> Pinned</span>}
                                                </div>
                                                <h3 className="mt-1 text-sm font-semibold">{announcement.title}</h3>
                                                <p className="mt-1 text-xs text-muted-foreground">{announcement.excerpt}</p>
                                                <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground/60">
                                                    <span>by {announcement.creator.name}</span>
                                                    <span>{new Date(announcement.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(announcement.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                                                    {announcement.comments_count > 0 && <span>{announcement.comments_count} comments</span>}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};
