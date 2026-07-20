export type SpaceMemberRole = 'admin' | 'contributor' | 'viewer';

export type SpaceMember = {
    id: number;
    name: string;
    email: string;
    role: SpaceMemberRole;
    joined_at: string | null;
};

export type Space = {
    id: number;
    name: string;
    description: string | null;
    is_public: boolean;
    document_count: number;
    member_count: number;
    user_role: SpaceMemberRole | null;
    created_at: string;
    creator: {
        id: number;
        name: string;
    };
};

export type SpaceDetail = Space & {
    members: SpaceMember[];
    documents: {
        id: number;
        title: string;
        description: string | null;
        file_type: string;
        file_size: number;
        formatted_size: string;
        status: string;
        version: number;
        icon: string;
        created_at: string;
        uploader: {
            id: number;
            name: string;
        };
    }[];
};
