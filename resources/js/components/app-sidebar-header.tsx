import { Breadcrumbs } from '@/components/breadcrumbs';
import NotificationBell from '@/components/notification-bell';
import SearchBar from '@/components/search-bar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useNotifications } from '@/hooks/use-notifications';
import { useToast } from '@/components/toast-notification';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { addToast } = useToast();
    const { unreadCount, markAsRead, markAllAsRead } = useNotifications(30000, (n) => {
        addToast(n.title, n.message);
    });

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="ml-auto flex items-center gap-2">
                <div className="hidden md:block">
                    <SearchBar />
                </div>
                <NotificationBell
                    unreadCount={unreadCount}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                />
            </div>
        </header>
    );
}
