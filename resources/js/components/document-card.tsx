import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ExternalLink, Share2, Pencil, Trash2, Check, X } from 'lucide-react';
import ShareModal from '@/components/share-modal';
import type { Document, DocumentShare } from '@/types';

const statusConfig = {
    published: { label: 'Published', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    draft: { label: 'Draft', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
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
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(document.title);
    const inputRef = useRef<HTMLInputElement>(null);
    const status = statusConfig[document.status];
    const displayCount = sharesCount ?? loadedShares.length;

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    function startEditing() {
        setEditValue(document.title);
        setIsEditing(true);
    }

    function cancelEditing() {
        setEditValue(document.title);
        setIsEditing(false);
    }

    function saveEditing() {
        const trimmed = editValue.trim();
        if (trimmed && trimmed !== document.title) {
            router.patch(`/documents/${document.id}`, { title: trimmed });
        }
        setIsEditing(false);
    }

    function handleTitleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEditing();
        } else if (e.key === 'Escape') {
            cancelEditing();
        }
    }

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
            <div className="group flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-white/5 dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
                {/* File Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10">
                    <FileText className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                </div>

                {/* File Info */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <div className="flex items-center gap-1.5">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={handleTitleKeyDown}
                                    onBlur={saveEditing}
                                    className="h-7 w-full min-w-0 max-w-xs rounded-md border border-blue-300 bg-white px-2 text-[15px] font-medium text-slate-900 outline-none ring-2 ring-blue-100 transition-shadow focus:border-blue-400 focus:ring-blue-200 dark:border-blue-600 dark:bg-slate-900 dark:text-white dark:ring-blue-900 dark:focus:border-blue-500 dark:focus:ring-blue-800"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={saveEditing}
                                    className="h-7 w-7 shrink-0 p-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950"
                                    title="Save"
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={cancelEditing}
                                    className="h-7 w-7 shrink-0 p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                                    title="Cancel"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <h3
                                className="cursor-pointer truncate text-[15px] font-medium text-slate-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                                onClick={() => router.get(`/documents/${document.id}`)}
                            >
                                {document.title}
                            </h3>
                        )}
                        <Badge className={status.className}>{status.label}</Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span>{document.formatted_size}</span>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span>v{document.version}</span>
                        {(versionsCount ?? 0) > 1 && (
                            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-100 px-1 text-[10px] font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                {versionsCount}
                            </span>
                        )}
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span>{new Date(document.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span>{document.uploader.name}</span>
                        {document.space && (
                            <>
                                <span className="text-slate-300 dark:text-slate-600">·</span>
                                <span>{document.space.name}</span>
                            </>
                        )}
                        {displayCount > 0 && (
                            <>
                                <span className="text-slate-300 dark:text-slate-600">·</span>
                                <span>{displayCount} {displayCount === 1 ? 'user' : 'users'}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:opacity-100">
                    <Button
                        size="sm"
                        onClick={() => router.get(`/documents/${document.id}`)}
                        className="h-8 gap-1.5 px-3 text-xs font-medium"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open
                    </Button>
                    {canShare && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleOpenShare}
                            className="h-8 gap-1.5 px-2.5 text-xs font-medium"
                            title="Share"
                        >
                            <Share2 className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">Share</span>
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={startEditing}
                        className="h-8 px-2.5"
                        title="Rename"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDelete}
                        className="h-8 px-2.5 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:border-red-800 dark:hover:bg-red-950 dark:hover:text-red-400"
                        title="Delete"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

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
