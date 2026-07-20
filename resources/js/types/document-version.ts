export type DocumentVersion = {
    id: number;
    version_number: number;
    file_size: number;
    formatted_size: string;
    description: string | null;
    created_at: string;
    creator: {
        id: number;
        name: string;
    };
};

export type PaginatedVersions = {
    data: DocumentVersion[];
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
