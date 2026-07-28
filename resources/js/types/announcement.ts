export type Announcement = {
    id: number;
    title: string;
    content?: string;
    excerpt?: string;
    status: 'draft' | 'published' | 'archived';
    is_pinned: boolean;
    created_at: string;
    updated_at?: string;
    can_edit?: boolean;
    creator: {
        id: number;
        name: string;
        avatar?: string;
    };
    target_space: {
        id: number;
        name: string;
    } | null;
};

export type PaginatedAnnouncements = {
    data: Announcement[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};
