import { Head } from '@inertiajs/react';
import RoleGuard from '@/components/role-guard';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

export default function AdminSettings() {
    return (
        <RoleGuard requiredRole="admin">
            <Head title="System Settings" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">System Settings</h1>
                    <p className="text-sm text-muted-foreground">Configure system-wide settings and preferences.</p>
                </div>
                <div className="relative min-h-[60vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </RoleGuard>
    );
}

AdminSettings.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Settings', href: '/admin/settings' },
    ],
};
