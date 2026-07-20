export type SearchFilters = {
    q?: string;
    file_type?: string;
    space_id?: string;
    date_range?: string;
};

export type SearchResult = {
    id: number;
    title: string;
    description: string | null;
    file_type: string;
    icon: string;
    formatted_size: string;
    created_at: string;
    uploader: {
        id: number;
        name: string;
    };
    space: {
        id: number;
        name: string;
    } | null;
};
