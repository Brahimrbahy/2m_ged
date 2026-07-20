import { Head } from '@inertiajs/react';
import RoleGuard from '@/components/role-guard';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

export default function ManagerDocuments() {
    return (
        <RoleGuard requiredRole="manager">
            <Head title="All Documents" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">All Documents</h1>
                    <p className="text-sm text-muted-foreground">View and manage all team documents.</p>
                </div>
                <div className="relative min-h-[60vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </RoleGuard>
    );
}

ManagerDocuments.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manager', href: '/manager/dashboard' },
        { title: 'Documents', href: '/manager/documents' },
    ],
};
