import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Space } from '@/types';

const roleBadgeClasses: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    contributor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    viewer: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
};

interface SpaceCardProps {
    space: Space;
}

export default function SpaceCard({ space }: SpaceCardProps) {
    return (
        <Card
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => router.get(`/spaces/${space.id}`)}
        >
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">📁</span>
                        <CardTitle className="text-base">{space.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                        {space.is_public && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                                Public
                            </Badge>
                        )}
                        {space.user_role && (
                            <Badge className={roleBadgeClasses[space.user_role]}>
                                {space.user_role}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {space.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{space.description}</p>
                )}
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{space.member_count} {space.member_count === 1 ? 'member' : 'members'}</span>
                    <span>{space.document_count} {space.document_count === 1 ? 'document' : 'documents'}</span>
                    <span>by {space.creator.name}</span>
                </div>
            </CardContent>
        </Card>
    );
}
