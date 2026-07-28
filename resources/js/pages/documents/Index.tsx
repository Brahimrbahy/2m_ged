import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FolderOpen } from 'lucide-react';
import DocumentCard from '@/components/document-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Document, PaginatedDocuments } from '@/types';

interface IndexProps {
    documents: PaginatedDocuments;
    filters: {
        search?: string;
    };
}

export default function Index({ documents, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const { url } = usePage();

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/documents', { search }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Documents" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
                    <Button onClick={() => router.get('/documents/create')}>
                        Upload Document
                    </Button>
                </div>

                <form onSubmit={handleSearch} className="flex max-w-md gap-2">
                    <Input
                        type="text"
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button type="submit" variant="outline">
                        Search
                    </Button>
                </form>

                {documents.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-solid p-12 text-center">
                        <FolderOpen className="h-10 w-10 text-muted-foreground" />
                        <h2 className="mt-4 text-lg font-semibold">No documents yet</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Upload your first document to get started.
                        </p>
                        <Button className="mt-4" onClick={() => router.get('/documents/create')}>
                            Upload Document
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {documents.data.map((doc: Document & { can_share?: boolean; shares_count?: number; versions_count?: number }) => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                canShare={doc.can_share}
                                sharesCount={doc.shares_count}
                                versionsCount={doc.versions_count}
                            />
                        ))}
                    </div>
                )}

                {documents.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {documents.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
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
        { title: 'Documents', href: '/documents' },
    ],
};
