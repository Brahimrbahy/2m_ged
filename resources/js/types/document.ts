export type Document = {
    id: number;
    title: string;
    description: string | null;
    file_path: string;
    file_type: string;
    file_size: number;
    formatted_size: string;
    uploaded_by: number;
    status: 'draft' | 'published' | 'archived';
    version: number;
    icon: string;
    created_at: string;
    updated_at: string;
    uploader: {
        id: number;
        name: string;
    };
    space: {
        id: number;
        name: string;
    } | null;
    [key: string]: unknown;
};

export type PaginatedDocuments = {
    data: Document[];
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
