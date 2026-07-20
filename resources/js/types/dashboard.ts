export type DashboardStats = {
    documents: number;
    spaces: number;
    team_members: number;
    shared_documents: number;
};

export type ActivityItem = {
    id: number;
    type: string;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
};

export type Announcement = {
    id: number;
    title: string;
    excerpt: string;
    status: 'draft' | 'published' | 'archived';
    is_pinned: boolean;
    created_at: string;
    comments_count: number;
    creator: {
        id: number;
        name: string;
    };
};
