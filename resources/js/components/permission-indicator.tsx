import { Lock, Eye, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PermissionLevel } from '@/types';

const iconMap: Record<PermissionLevel, typeof Lock> = {
    view_only: Eye,
    can_comment: MessageSquare,
    can_edit: Pencil,
    can_delete: Trash2,
};

const colorMap: Record<PermissionLevel, string> = {
    view_only: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    can_comment: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    can_edit: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    can_delete: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

type PermissionIndicatorProps = {
    permission: PermissionLevel;
    label?: string;
    showIcon?: boolean;
    size?: 'sm' | 'default';
};

export default function PermissionIndicator({ permission, label, showIcon = true, size = 'sm' }: PermissionIndicatorProps) {
    const Icon = iconMap[permission] || Lock;
    const color = colorMap[permission] || colorMap.view_only;

    return (
        <Badge variant="secondary" className={`${color} gap-1`}>
            {showIcon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
            <span>{label || permission.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
        </Badge>
    );
}
