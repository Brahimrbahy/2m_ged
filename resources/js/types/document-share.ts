export type PermissionLevel = 'view_only' | 'can_comment' | 'can_edit' | 'can_delete';

export type DocumentShare = {
    id: number;
    permission_level: PermissionLevel;
    permission_label: string;
    expires_at: string | null;
    has_expired: boolean;
    user: {
        id: number;
        name: string;
        email: string;
    };
};

export const PERMISSION_LABELS: Record<PermissionLevel, string> = {
    view_only: 'View Only',
    can_comment: 'Can Comment',
    can_edit: 'Can Edit',
    can_delete: 'Can Delete',
};

export const PERMISSION_OPTIONS: { value: PermissionLevel; label: string }[] = [
    { value: 'view_only', label: 'View Only' },
    { value: 'can_comment', label: 'Can Comment' },
    { value: 'can_edit', label: 'Can Edit' },
    { value: 'can_delete', label: 'Can Delete' },
];
