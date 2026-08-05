import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { getFileIcon } from '@/lib/icons';
import {
    FileText,
    Search,
    Plus,
    Trash2,
    Download,
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    ExternalLink,
    Pencil,
    Share2,
    X,
    Eye,
    ArrowUpDown,
} from 'lucide-react';
import type { Document, PaginatedDocuments } from '@/types';

type Props = {
    documents: PaginatedDocuments;
    filters: {
        search?: string;
        file_type?: string;
        date_range?: string;
        status?: string;
        sort?: string;
        dir?: string;
    };
};

const statusConfig: Record<
    string,
    { label: string; className: string }
> = {
    published: {
        label: 'Published',
        className:
            'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    },
    draft: {
        label: 'Draft',
        className:
            'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    },
    archived: {
        label: 'Archived',
        className:
            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
};

const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'pdf', label: 'PDF' },
    { value: 'word', label: 'Word' },
    { value: 'excel', label: 'Excel' },
    { value: 'powerpoint', label: 'PowerPoint' },
    { value: 'image', label: 'Image' },
];

const dateOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
];

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' },
];

export default function ManagerDocuments({ documents, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [fileType, setFileType] = useState(filters.file_type ?? '');
    const [dateRange, setDateRange] = useState(filters.date_range ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);

    const currentSort = filters.sort ?? 'created_at';
    const currentDir = filters.dir ?? 'desc';

    const applyFilters = (overrides?: Record<string, string>) => {
        const params: Record<string, string> = {};
        const s = overrides?.search ?? search;
        const ft = overrides?.file_type ?? fileType;
        const dr = overrides?.date_range ?? dateRange;
        const st = overrides?.status ?? statusFilter;
        if (s) params.search = s;
        if (ft) params.file_type = ft;
        if (dr) params.date_range = dr;
        if (st) params.status = st;
        params.sort = currentSort;
        params.dir = currentDir;
        router.get('/manager/documents', params, { preserveState: true });
    };

    const handleSort = (field: string) => {
        const params: Record<string, string> = { sort: field };
        if (field === currentSort) {
            params.dir = currentDir === 'asc' ? 'desc' : 'asc';
        } else {
            params.dir = 'desc';
        }
        if (search) params.search = search;
        if (fileType) params.file_type = fileType;
        if (dateRange) params.date_range = dateRange;
        if (statusFilter) params.status = statusFilter;
        router.get('/manager/documents', params, { preserveState: true });
    };

    const toggleSelect = (id: number) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === documents.data.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(documents.data.map((d) => d.id)));
        }
    };

    const clearSelection = () => setSelectedIds(new Set());

    const handleBulkDelete = () => {
        router.post(
            '/manager/documents/bulk-delete',
            { ids: Array.from(selectedIds) },
            {
                onSuccess: () => {
                    setSelectedIds(new Set());
                    setDeleteDialogOpen(false);
                },
            },
        );
    };

    const handleSingleDelete = (doc: Document) => {
        router.delete(`/documents/${doc.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const handleBulkDownload = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/manager/documents/bulk-download';
        const csrfToken = document.querySelector(
            'meta[name="csrf-token"]',
        )?.getAttribute('content');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }
        selectedIds.forEach((id) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'ids[]';
            input.value = String(id);
            form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    const pageCount = Math.ceil(documents.total / documents.per_page);

    return (
        <>
            <Head title="All Documents" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">
                                All Documents
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {documents.total} document
                                {documents.total !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => router.get('/documents/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Document
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[200px] flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search documents..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && applyFilters()
                            }
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={fileType}
                        onValueChange={(v) => {
                            setFileType(v);
                            applyFilters({ file_type: v });
                        }}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            {typeOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={dateRange}
                        onValueChange={(v) => {
                            setDateRange(v);
                            applyFilters({ date_range: v });
                        }}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="All Time" />
                        </SelectTrigger>
                        <SelectContent>
                            {dateOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={statusFilter}
                        onValueChange={(v) => {
                            setStatusFilter(v);
                            applyFilters({ status: v });
                        }}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearch('');
                            setFileType('');
                            setDateRange('');
                            setStatusFilter('');
                            router.get(
                                '/manager/documents',
                                {},
                                { preserveState: true },
                            );
                        }}
                        className="text-muted-foreground"
                    >
                        <X className="mr-1 h-4 w-4" />
                        Clear
                    </Button>
                </div>

                {/* Bulk Actions Bar */}
                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2.5">
                        <span className="text-sm font-medium">
                            {selectedIds.size} selected
                        </span>
                        <div className="ml-auto flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBulkDownload}
                            >
                                <Download className="mr-1.5 h-4 w-4" />
                                Download
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                <Trash2 className="mr-1.5 h-4 w-4" />
                                Delete
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearSelection}
                                className="text-muted-foreground"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Documents Table */}
                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="w-10 px-4 py-3">
                                    <Checkbox
                                        checked={
                                            documents.data.length > 0 &&
                                            selectedIds.size ===
                                                documents.data.length
                                        }
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <button
                                        onClick={() => handleSort('title')}
                                        className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                                    >
                                        Name
                                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <button
                                        onClick={() =>
                                            handleSort('created_at')
                                        }
                                        className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                                    >
                                        Date
                                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <button
                                        onClick={() =>
                                            handleSort('file_size')
                                        }
                                        className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                                    >
                                        Size
                                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    Owner
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <button
                                        onClick={() => handleSort('status')}
                                        className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                                    >
                                        Status
                                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {documents.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-16 text-center"
                                    >
                                        <FolderOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                                        <p className="text-base font-medium">
                                            No documents found
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {search ||
                                            fileType ||
                                            dateRange ||
                                            statusFilter
                                                ? 'Try adjusting your filters.'
                                                : 'Upload your first document to get started.'}
                                        </p>
                                        {!search &&
                                            !fileType &&
                                            !dateRange &&
                                            !statusFilter && (
                                                <Button
                                                    className="mt-4"
                                                    onClick={() =>
                                                        router.get(
                                                            '/documents/create',
                                                        )
                                                    }
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Upload Document
                                                </Button>
                                            )}
                                    </td>
                                </tr>
                            ) : (
                                documents.data.map(
                                    (doc: Document & { can_edit?: boolean; can_delete?: boolean; can_share?: boolean; shares_count?: number; versions_count?: number }) => {
                                        const status =
                                            statusConfig[doc.status] ??
                                            statusConfig.draft;
                                        const FileIcon =
                                            getFileIcon(doc.icon);

                                        return (
                                            <tr
                                                key={doc.id}
                                                className={`group transition-colors hover:bg-muted/30 ${
                                                    selectedIds.has(doc.id)
                                                        ? 'bg-primary/5'
                                                        : ''
                                                }`}
                                            >
                                                <td className="px-4 py-3">
                                                    <Checkbox
                                                        checked={selectedIds.has(
                                                            doc.id,
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleSelect(doc.id)
                                                        }
                                                        aria-label={`Select ${doc.title}`}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                                                            <FileIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span
                                                                className="cursor-pointer font-medium hover:text-blue-600 dark:hover:text-blue-400"
                                                                onClick={() =>
                                                                    router.get(
                                                                        `/documents/${doc.id}`,
                                                                    )
                                                                }
                                                            >
                                                                {doc.title}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {doc.file_type.toUpperCase()}
                                                                {doc.space && (
                                                                    <>
                                                                        {' '}
                                                                        &middot;{' '}
                                                                        {
                                                                            doc
                                                                                .space
                                                                                .name
                                                                        }
                                                                    </>
                                                                )}
                                                                {(doc
                                                                    .versions_count ??
                                                                    0) > 1 && (
                                                                    <>
                                                                        {' '}
                                                                        &middot;{' '}
                                                                        v
                                                                        {
                                                                            doc.version
                                                                        }
                                                                    </>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                                                    {new Date(
                                                        doc.created_at,
                                                    ).toLocaleDateString(
                                                        'en-US',
                                                        {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        },
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                                                    {doc.formatted_size}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {doc.uploader.name}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        className={
                                                            status.className
                                                        }
                                                    >
                                                        {status.label}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                router.get(
                                                                    `/documents/${doc.id}`,
                                                                )
                                                            }
                                                            className="h-8 w-8 p-0"
                                                            title="View"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {doc.can_edit && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    router.get(
                                                                        `/documents/${doc.id}`,
                                                                    )
                                                                }
                                                                className="h-8 w-8 p-0"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                router.get(
                                                                    `/documents/${doc.id}`,
                                                                )
                                                            }
                                                            className="h-8 w-8 p-0"
                                                            title="Open"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                        {doc.can_delete && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setDeleteTarget(
                                                                        doc,
                                                                    )
                                                                }
                                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    },
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {documents.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing{' '}
                            {(documents.current_page - 1) *
                                documents.per_page + 1}{' '}
                            to{' '}
                            {Math.min(
                                documents.current_page * documents.per_page,
                                documents.total,
                            )}{' '}
                            of {documents.total} documents
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={documents.current_page === 1}
                                onClick={() => {
                                    const params: Record<string, string> = {
                                        page: String(
                                            documents.current_page - 1,
                                        ),
                                    };
                                    if (search) params.search = search;
                                    if (fileType)
                                        params.file_type = fileType;
                                    if (dateRange)
                                        params.date_range = dateRange;
                                    if (statusFilter)
                                        params.status = statusFilter;
                                    params.sort = currentSort;
                                    params.dir = currentDir;
                                    router.get('/manager/documents', params, {
                                        preserveState: true,
                                    });
                                }}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {documents.current_page} of{' '}
                                {documents.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                    documents.current_page ===
                                    documents.last_page
                                }
                                onClick={() => {
                                    const params: Record<string, string> = {
                                        page: String(
                                            documents.current_page + 1,
                                        ),
                                    };
                                    if (search) params.search = search;
                                    if (fileType)
                                        params.file_type = fileType;
                                    if (dateRange)
                                        params.date_range = dateRange;
                                    if (statusFilter)
                                        params.status = statusFilter;
                                    params.sort = currentSort;
                                    params.dir = currentDir;
                                    router.get('/manager/documents', params, {
                                        preserveState: true,
                                    });
                                }}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Single Delete Confirmation */}
            <Dialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Document</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <strong>{deleteTarget?.title}</strong>? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                deleteTarget && handleSingleDelete(deleteTarget)
                            }
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Confirmation */}
            <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Documents</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <strong>{selectedIds.size}</strong> document
                            {selectedIds.size !== 1 ? 's' : ''}? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBulkDelete}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete {selectedIds.size} document
                            {selectedIds.size !== 1 ? 's' : ''}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ManagerDocuments.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manager', href: '/manager/dashboard' },
        { title: 'Documents', href: '/manager/documents' },
    ],
};
