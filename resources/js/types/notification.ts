export type NotificationType =
    | 'document_uploaded'
    | 'document_updated'
    | 'document_deleted'
    | 'member_added'
    | 'member_removed'
    | 'space_updated';

export type Notification = {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    action_url: string | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
};

export type PaginatedNotifications = {
    data: Notification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
