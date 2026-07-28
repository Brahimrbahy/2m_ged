import { Head, router } from '@inertiajs/react';
import { FolderOpen } from 'lucide-react';
import SpaceCard from '@/components/space-card';
import { Button } from '@/components/ui/button';
import type { Space } from '@/types';

interface IndexProps {
    spaces: Space[];
}

export default function Index({ spaces }: IndexProps) {
    return (
        <>
            <Head title="Spaces" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Spaces</h1>
                    <Button onClick={() => router.get('/spaces/create')}>
                        Create Space
                    </Button>
                </div>

                {spaces.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-solid p-12 text-center">
                        <FolderOpen className="h-10 w-10 text-muted-foreground" />
                        <h2 className="mt-4 text-lg font-semibold">No spaces yet</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Create a space to organize and collaborate on documents.
                        </p>
                        <Button className="mt-4" onClick={() => router.get('/spaces/create')}>
                            Create Space
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {spaces.map((space) => (
                            <SpaceCard key={space.id} space={space} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Spaces', href: '/spaces' },
    ],
};
