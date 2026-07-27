import { usePage } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import type { UserRole } from '@/types';

interface RoleGuardProps {
    requiredRole: UserRole;
    children: React.ReactNode;
}

const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    manager: 2,
    user: 1,
};

export default function RoleGuard({ requiredRole, children }: RoleGuardProps) {
    const { auth } = usePage().props;
    const userRole = auth.user?.role as UserRole | undefined;

    if (!userRole || roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
                <Lock className="h-10 w-10 text-muted-foreground" />
                <h2 className="mt-4 text-lg font-semibold">Access Denied</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    You don't have permission to view this page.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Required role: {requiredRole} — Your role: {userRole ?? 'unknown'}
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
