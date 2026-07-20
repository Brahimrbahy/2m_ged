import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';
import ShareModal from '@/components/share-modal';
import type { Document, DocumentShare } from '@/types';

const statusConfig = {
    published: { label: 'Published', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    draft: { label: 'Draft', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    archived: { label: 'Archived', className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
} as const;

interface DocumentCardProps {
    document: Document;
    shares?: DocumentShare[];
    canShare?: boolean;
    sharesCount?: number;
    versionsCount?: number;
}

export default function DocumentCard({ document, shares = [], canShare = false, sharesCount, versionsCount }: DocumentCardProps) {
    const [shareOpen, setShareOpen] = useState(false);
    const [loadedShares, setLoadedShares] = useState<DocumentShare[]>(shares);
    const status = statusConfig[document.status];
    const displayCount = sharesCount ?? loadedShares.length;

    function handleDelete() {
        if (confirm('Are you sure you want to delete this document?')) {
            router.delete(`/documents/${document.id}`);
        }
    }

    async function handleOpenShare() {
        if (loadedShares.length === 0 && canShare) {
            try {
                const res = await fetch(`/documents/${document.id}/shares`);
                const data = await res.json();
                setLoadedShares(data.shares || []);
            } catch {
                // silently fail
            }
        }
        setShareOpen(true);
    }

    return (
        <>
            <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{document.icon}</span>
                            <CardTitle className="text-base">{document.title}</CardTitle>
                        </div>
                        <Badge className={status.className}>{status.label}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {document.description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">{document.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{document.formatted_size}</span>
                        <span className="flex items-center gap-1">
                            v{document.version}
                            {(versionsCount ?? 0) > 1 && (
                                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-100 px-1 text-[10px] font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                    {versionsCount} ver.
                                </span>
                            )}
                        </span>
                        <span>{new Date(document.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                        by {document.uploader.name}
                        {document.space && <span> in {document.space.name}</span>}
                    </div>
                    {displayCount > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-200 px-1 text-[10px] font-medium dark:bg-slate-700">
                                {displayCount}
                            </span>
                            <span>{displayCount === 1 ? 'person' : 'people'} have access</span>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex gap-2 pt-0">
                    <Button size="sm" variant="outline" onClick={() => router.get(`/documents/${document.id}`)}>
                        Open
                    </Button>
                    {(versionsCount ?? 0) > 0 && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.get(`/documents/${document.id}/versions`)}
                            title="Version History"
                        >
                            <History className="h-3.5 w-3.5" />
                        </Button>
                    )}
                    {canShare && (
                        <Button size="sm" variant="outline" onClick={handleOpenShare}>
                            Share
                        </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={handleDelete}>
                        Delete
                    </Button>
                </CardFooter>
            </Card>

            <ShareModal
                open={shareOpen}
                onClose={() => setShareOpen(false)}
                documentId={document.id}
                documentTitle={document.title}
                initialShares={loadedShares}
                canShare={canShare}
            />
        </>
    );
}
