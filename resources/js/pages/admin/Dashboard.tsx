import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, FolderOpen, HardDrive, Activity, TrendingUp } from 'lucide-react';
import StatCard from '@/components/stat-card';
import type { AdminStats, AdminSpaceStat, DocumentsByMonth, UsersByRole } from '@/types';

type Props = {
    stats: AdminStats;
    mostActiveSpaces: AdminSpaceStat[];
    documentsByMonth: DocumentsByMonth[];
    usersByRole: UsersByRole[];
};

export default function AdminDashboard({ stats, mostActiveSpaces, documentsByMonth, usersByRole }: Props) {
    const maxDocuments = Math.max(...mostActiveSpaces.map((s) => s.documents_count), 1);

    const roleColors: Record<string, string> = {
        admin: 'bg-red-500',
        manager: 'bg-purple-500',
        user: 'bg-blue-500',
    };

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">System overview and statistics.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Total Users" value={stats.total_users} icon={Users} />
                    <StatCard label="Total Documents" value={stats.total_documents} icon={FileText} />
                    <StatCard label="Total Spaces" value={stats.total_spaces} icon={FolderOpen} />
                    <StatCard label="Storage Used" value={0} icon={HardDrive} />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Activity className="h-4 w-4" />
                                Active Users This Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                                    {stats.active_users_this_month}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Users who logged in or joined this month
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Out of {stats.total_users} total users ({Math.round((stats.active_users_this_month / Math.max(stats.total_users, 1)) * 100)}%)
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="h-4 w-4" />
                                Users by Role
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {usersByRole.map((item) => {
                                const total = usersByRole.reduce((sum, r) => sum + r.count, 0);
                                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                                return (
                                    <div key={item.role} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="capitalize font-medium">{item.role}</span>
                                            <span className="text-muted-foreground">{item.count} ({pct}%)</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${roleColors[item.role] ?? 'bg-slate-500'}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            {usersByRole.length === 0 && (
                                <p className="text-sm text-muted-foreground">No data available.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <HardDrive className="h-4 w-4" />
                                Storage Usage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold">{stats.storage_used_formatted}</span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Total file storage across {stats.total_documents} documents
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FolderOpen className="h-4 w-4" />
                                Most Active Spaces
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {mostActiveSpaces.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No spaces found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {mostActiveSpaces.slice(0, 5).map((space) => (
                                        <div key={space.id} className="flex items-center gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{space.name}</p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-primary"
                                                            style={{ width: `${(space.documents_count / maxDocuments) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {space.documents_count} docs
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {documentsByMonth.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Documents Uploaded Over Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-1 h-32">
                                {documentsByMonth.map((item) => {
                                    const maxCount = Math.max(...documentsByMonth.map((d) => d.count), 1);
                                    const height = (item.count / maxCount) * 100;
                                    return (
                                        <div
                                            key={item.month}
                                            className="flex-1 flex flex-col items-center gap-1"
                                            title={`${item.month}: ${item.count} documents`}
                                        >
                                            <span className="text-[10px] text-muted-foreground">{item.count}</span>
                                            <div
                                                className="w-full rounded-t bg-primary/80 min-h-[2px]"
                                                style={{ height: `${height}%` }}
                                            />
                                            <span className="text-[9px] text-muted-foreground -rotate-45 origin-left">
                                                {item.month}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
    ],
};
