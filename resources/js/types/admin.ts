export type AdminUser = {
    id: number;
    email: string;
    full_name: string | null;
    name: string;
    role: 'admin' | 'manager' | 'user';
    department: string | null;
    status: 'active' | 'inactive';
    created_at: string;
};

export type AdminStats = {
    total_users: number;
    total_documents: number;
    total_spaces: number;
    active_users_this_month: number;
    storage_used: number;
    storage_used_formatted: string;
};

export type AdminSpaceStat = {
    id: number;
    name: string;
    description: string | null;
    documents_count: number;
    is_public: boolean;
};

export type DocumentsByMonth = {
    month: string;
    count: number;
};

export type UsersByRole = {
    role: string;
    count: number;
};

export type ImportResult = {
    success: boolean;
    created: number;
    skipped: number;
    errors: string[];
    message: string;
};

export type PaginatedUsers = {
    data: AdminUser[];
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

export type AdminSettings = {
    app: {
        name: string;
        support_email: string;
        default_locale: string;
        date_format: string;
    };
    documents: {
        max_upload_size: number;
        allowed_file_types: string;
    };
    spaces: {
        default_visibility: 'public' | 'private';
        user_storage_quota: number;
    };
    users: {
        allow_registration: boolean;
        default_role: 'admin' | 'manager' | 'user';
        require_email_verification: boolean;
    };
};
