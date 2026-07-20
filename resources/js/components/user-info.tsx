import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/types';

const roleBadgeClasses: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    user: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
};

const roleLabels: Record<string, string> = {
    admin: 'Admin',
    manager: 'Manager',
    user: 'User',
};

export function UserInfo({
    user,
    showEmail = false,
    showRole = true,
}: {
    user: User;
    showEmail?: boolean;
    showRole?: boolean;
}) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
                {showRole && user.role && (
                    <Badge
                        variant="outline"
                        className={`mt-1 w-fit text-[10px] px-1.5 py-0 ${roleBadgeClasses[user.role] ?? ''}`}
                    >
                        {roleLabels[user.role] ?? user.role}
                    </Badge>
                )}
            </div>
        </>
    );
}
