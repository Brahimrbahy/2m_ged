import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Download, RotateCcw, ChevronRight, Clock } from 'lucide-react';
import type { DocumentVersion } from '@/types';

interface VersionHistoryPanelProps {
    documentId: number;
    documentTitle: string;
    versions: DocumentVersion[];
    versionsCount: number;
    canEdit: boolean;
}

function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
}

export default function VersionHistoryPanel({ documentId, documentTitle, versions, versionsCount, canEdit }: VersionHistoryPanelProps) {
    const [confirmRestore, setConfirmRestore] = useState<number | null>(null);

    const handleRestore = (versionId: number) => {
        router.post(`/documents/${documentId}/versions/${versionId}/restore`, {}, {
            onFinish: () => setConfirmRestore(null),
        });
    };

    if (versions.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <History className="mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No version history available.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <History className="h-4 w-4" />
                        Version History
                        <Badge variant="secondary" className="ml-1">{versionsCount}</Badge>
                    </CardTitle>
                    {versionsCount > 5 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.get(`/documents/${documentId}/versions`)}
                        >
                            View all
                            <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y">
                    {versions.map((version) => (
                        <div key={version.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">
                                v{version.version_number}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">v{version.version_number}</span>
                                    {version.description && (
                                        <span className="truncate text-xs text-muted-foreground">- {version.description}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>{version.creator.name}</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {timeAgo(version.created_at)}
                                    </span>
                                    <span>{version.formatted_size}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get(`/documents/${documentId}/versions/${version.id}/download`)}
                                    title="Download this version"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                </Button>
                                {canEdit && confirmRestore !== version.id && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setConfirmRestore(version.id)}
                                        title="Restore this version"
                                        className="text-amber-600 hover:text-amber-700"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                                {confirmRestore === version.id && (
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleRestore(version.id)}
                                        >
                                            Restore
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setConfirmRestore(null)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
