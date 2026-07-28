import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import ShareModal from '@/components/share-modal';
import PermissionIndicator from '@/components/permission-indicator';
import VersionHistoryPanel from '@/components/version-history-panel';
import { getFileIcon } from '@/lib/icons';
import type { Document, DocumentShare, DocumentVersion } from '@/types';

const statusConfig = {
    published: {
        label: 'Published',
        className:
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    },
    draft: {
        label: 'Draft',
        className:
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    },
    archived: {
        label: 'Archived',
        className:
            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    },
} as const;

interface ShowProps {
    document: Document & {
        can_edit: boolean;
        can_delete: boolean;
        can_share: boolean;
        shares: DocumentShare[];
        versions_count: number;
        latest_versions: DocumentVersion[];
    };
}

export default function Show({ document }: ShowProps) {
    const [shareOpen, setShareOpen] = useState(false);
    const status = statusConfig[document.status];

    function handleDelete() {
        if (confirm('Are you sure you want to delete this document?')) {
            router.delete(`/documents/${document.id}`);
        }
    }

    return (
        <>
            <Head title={document.title} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {(() => { const Icon = getFileIcon(document.icon as string); return <Icon className="h-8 w-8 text-muted-foreground" />; })()}
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {document.title}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Uploaded by {document.uploader.name} on{' '}
                                {new Date(
                                    document.created_at,
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <Badge className={status.className}>{status.label}</Badge>
                </div>

                <div className="rounded-xl border p-6">
                    <h2 className="text-lg font-semibold">Details</h2>
                    <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <dt className="text-muted-foreground">File Type</dt>
                            <dd className="font-medium">
                                {document.file_type.toUpperCase()}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Size</dt>
                            <dd className="font-medium">
                                {document.formatted_size}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Version</dt>
                            <dd className="font-medium">{document.version}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">
                                Last Updated
                            </dt>
                            <dd className="font-medium">
                                {new Date(
                                    document.updated_at,
                                ).toLocaleDateString()}
                            </dd>
                        </div>
                        {document.space && (
                            <div>
                                <dt className="text-muted-foreground">Space</dt>
                                <dd className="font-medium">
                                    {document.space.name}
                                </dd>
                            </div>
                        )}
                    </dl>
                    {document.description && (
                        <div className="mt-4">
                            <dt className="text-sm text-muted-foreground">
                                Description
                            </dt>
                            <dd className="mt-1 text-sm">
                                {document.description}
                            </dd>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border p-6">
                    <h2 className="text-lg font-semibold">File Preview</h2>
                    <div className="mt-4">
                        {['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(
                            document.file_type,
                        ) ? (
                            <img
                                src={`/documents/${document.id}/preview`}
                                alt={document.title}
                                className="max-h-96 rounded-lg border object-contain"
                            />
                        ) : document.file_type === 'pdf' ? (
                            <iframe
                                src={`/documents/${document.id}/preview`}
                                className="h-[600px] w-full rounded-lg border"
                                title={document.title}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-3 rounded-lg border border-solid p-8">
                                {(() => { const Icon = getFileIcon(document.icon as string); return <Icon className="h-10 w-10 text-muted-foreground" />; })()}
                                <p className="text-sm text-muted-foreground">
                                    Preview not available for .
                                    {document.file_type} files
                                </p>
                                <Link
                                    href={`/documents/${document.id}/preview`}
                                >
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download File
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {document.shares.length > 0 && (
                    <div className="rounded-xl border p-6">
                        <h2 className="text-lg font-semibold">Shared with</h2>
                        <div className="mt-4 space-y-2">
                            {document.shares.map((share) => (
                                <div
                                    key={share.id}
                                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-medium dark:bg-slate-700">
                                            {share.user.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {share.user.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {share.user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <PermissionIndicator
                                            permission={share.permission_level}
                                            size="default"
                                        />
                                        {share.has_expired && (
                                            <Badge variant="destructive">
                                                Expired
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <VersionHistoryPanel
                    documentId={document.id}
                    documentTitle={document.title}
                    versions={document.latest_versions}
                    versionsCount={document.versions_count}
                    canEdit={document.can_edit}
                />

                <div className="flex gap-2">
                    {document.can_share && (
                        <Button
                            variant="outline"
                            onClick={() => setShareOpen(true)}
                        >
                            Share
                        </Button>
                    )}
                    {document.can_delete && (
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    )}
                </div>
            </div>

            {document.can_share && (
                <ShareModal
                    open={shareOpen}
                    onClose={() => setShareOpen(false)}
                    documentId={document.id}
                    documentTitle={document.title}
                    initialShares={document.shares}
                    canShare={document.can_share}
                />
            )}
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Documents', href: '/documents' },
        { title: 'Details', href: '' },
    ],
};
