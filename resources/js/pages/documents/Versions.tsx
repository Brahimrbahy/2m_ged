import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Download, RotateCcw, ChevronLeft, ChevronRight, Clock, ArrowLeft } from 'lucide-react';
import VersionComparison from '@/components/version-comparison';
import type { DocumentVersion, PaginatedVersions } from '@/types';

type Props = {
    document: {
        id: number;
        title: string;
        version: number;
        file_type: string;
        icon: string;
    };
    versions: PaginatedVersions;
};

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

export default function Versions({ document, versions }: Props) {
    const [selectedVersions, setSelectedVersions] = useState<DocumentVersion[]>([]);
    const [confirmRestore, setConfirmRestore] = useState<number | null>(null);

    const handleRestore = (versionId: number) => {
        router.post(`/documents/${document.id}/versions/${versionId}/restore`, {}, {
            onFinish: () => setConfirmRestore(null),
        });
    };

    const toggleSelect = (version: DocumentVersion) => {
        setSelectedVersions((prev) => {
            const exists = prev.find((v) => v.id === version.id);
            if (exists) return prev.filter((v) => v.id !== version.id);
            if (prev.length >= 2) return [prev[1], version];
            return [...prev, version];
        });
    };

    return (
        <>
            <Head title={`Version History - ${document.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={() => router.get(`/documents/${document.id}`)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{document.icon}</span>
                            <div>
                                <h1 className="text-2xl font-bold">Version History</h1>
                                <p className="text-sm text-muted-foreground">
                                    {document.title} - {versions.total} versions
                                </p>
                            </div>
                        </div>
                    </div>
                    {selectedVersions.length === 2 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const el = document.getElementById('comparison');
                                el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            Compare selected
                        </Button>
                    )}
                </div>

                {selectedVersions.length === 2 && (
                    <div id="comparison">
                        <VersionComparison
                            oldVersion={selectedVersions[0]}
                            newVersion={selectedVersions[1]}
                            onClose={() => setSelectedVersions([])}
                        />
                    </div>
                )}

                {versions.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <History className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">No versions yet</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Version history will appear as documents are uploaded and updated.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {versions.data.map((version) => {
                                    const isCurrent = version.version_number === document.version;
                                    const isSelected = selectedVersions.some((v) => v.id === version.id);

                                    return (
                                        <div
                                            key={version.id}
                                            className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30 ${isSelected ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold dark:bg-slate-800">
                                                v{version.version_number}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Version {version.version_number}</span>
                                                    {isCurrent && (
                                                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                                            Current
                                                        </Badge>
                                                    )}
                                                </div>
                                                {version.description && (
                                                    <p className="mt-0.5 text-sm text-muted-foreground">{version.description}</p>
                                                )}
                                                <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {timeAgo(version.created_at)}
                                                    </span>
                                                    <span>by {version.creator.name}</span>
                                                    <span>{version.formatted_size}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant={isSelected ? 'default' : 'ghost'}
                                                    size="sm"
                                                    onClick={() => toggleSelect(version)}
                                                    title="Select for comparison"
                                                >
                                                    {isSelected ? 'Selected' : 'Compare'}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.get(`/documents/${document.id}/versions/${version.id}/download`)}
                                                    title="Download"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                {!isCurrent && (
                                                    <>
                                                        {confirmRestore === version.id ? (
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleRestore(version.id)}
                                                                >
                                                                    Confirm
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => setConfirmRestore(null)}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setConfirmRestore(version.id)}
                                                                title="Restore this version"
                                                                className="text-amber-600 hover:text-amber-700"
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {versions.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {((versions.current_page - 1) * versions.per_page) + 1} to{' '}
                            {Math.min(versions.current_page * versions.per_page, versions.total)} of {versions.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={versions.current_page === 1}
                                onClick={() => router.get(`/documents/${document.id}/versions?page=${versions.current_page - 1}`)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {versions.current_page} of {versions.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={versions.current_page === versions.last_page}
                                onClick={() => router.get(`/documents/${document.id}/versions?page=${versions.current_page + 1}`)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Versions.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Documents', href: '/documents' },
        { title: 'Version History', href: '' },
    ],
};
