import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DocumentCard from '@/components/document-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Document, PaginatedDocuments, Space } from '@/types';

interface SearchProps {
    documents: PaginatedDocuments;
    spaces: { id: number; name: string }[];
    filters: {
        q?: string;
        file_type?: string;
        space_id?: string;
        date_range?: string;
    };
}

const fileTypeOptions = [
    { label: 'All Types', value: '' },
    { label: 'PDF', value: 'pdf' },
    { label: 'Word', value: 'word' },
    { label: 'Excel', value: 'excel' },
    { label: 'PowerPoint', value: 'powerpoint' },
    { label: 'Images', value: 'image' },
];

const dateRangeOptions = [
    { label: 'All Time', value: '' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
];

export default function Search({ documents, spaces, filters }: SearchProps) {
    const [query, setQuery] = useState(filters.q ?? '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilters({ q: query || undefined });
    }

    function applyFilters(overrides: Record<string, string | undefined>) {
        const params: Record<string, string> = {};
        if (overrides.q !== undefined ? overrides.q : filters.q) params.q = overrides.q ?? filters.q ?? '';
        if (overrides.file_type !== undefined ? overrides.file_type : filters.file_type) params.file_type = overrides.file_type ?? filters.file_type ?? '';
        if (overrides.space_id !== undefined ? overrides.space_id : filters.space_id) params.space_id = overrides.space_id ?? filters.space_id ?? '';
        if (overrides.date_range !== undefined ? overrides.date_range : filters.date_range) params.date_range = overrides.date_range ?? filters.date_range ?? '';
        router.get('/search', params, { preserveState: true, replace: true });
    }

    function clearFilters() {
        setQuery('');
        router.get('/search', {}, { preserveState: true, replace: true });
    }

    const hasActiveFilters = filters.file_type || filters.space_id || filters.date_range;

    return (
        <>
            <Head title="Search Documents" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Search by title or description..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="max-w-xl"
                    />
                    <Button type="submit">Search</Button>
                    {hasActiveFilters && (
                        <Button variant="ghost" onClick={clearFilters}>
                            Clear
                        </Button>
                    )}
                </form>

                <div className="flex gap-6">
                    {/* Filters Sidebar */}
                    <div className="w-56 shrink-0 space-y-6">
                        {/* File Type */}
                        <div>
                            <h3 className="mb-2 text-sm font-medium">File Type</h3>
                            <div className="space-y-1">
                                {fileTypeOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => applyFilters({ file_type: option.value || undefined })}
                                        className={`block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                                            (filters.file_type ?? '') === option.value
                                                ? 'bg-blue-50 font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                                : 'text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Range */}
                        <div>
                            <h3 className="mb-2 text-sm font-medium">Date</h3>
                            <div className="space-y-1">
                                {dateRangeOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => applyFilters({ date_range: option.value || undefined })}
                                        className={`block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                                            (filters.date_range ?? '') === option.value
                                                ? 'bg-blue-50 font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                                : 'text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Space */}
                        <div>
                            <h3 className="mb-2 text-sm font-medium">Space</h3>
                            <select
                                value={filters.space_id ?? ''}
                                onChange={(e) => applyFilters({ space_id: e.target.value || undefined })}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"
                            >
                                <option value="">All Spaces</option>
                                {spaces.map((space) => (
                                    <option key={space.id} value={space.id}>
                                        {space.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="min-w-0 flex-1">
                        {filters.q && (
                            <p className="mb-3 text-sm text-muted-foreground">
                                {documents.total} {documents.total === 1 ? 'result' : 'results'} for "{filters.q}"
                            </p>
                        )}

                        {!filters.q && !hasActiveFilters && (
                            <p className="mb-3 text-sm text-muted-foreground">
                                {documents.total} {documents.total === 1 ? 'document' : 'documents'} total
                            </p>
                        )}

                        {documents.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
                                <span className="text-4xl">🔍</span>
                                <h2 className="mt-4 text-lg font-semibold">No results found</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try adjusting your search or filters.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {documents.data.map((doc: Document) => (
                                    <DocumentCard key={doc.id} document={doc} />
                                ))}
                            </div>
                        )}

                        {documents.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
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
                </div>
            </div>
        </>
    );
}

Search.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Search', href: '/search' },
    ],
};
