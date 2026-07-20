import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RotateCcw, ArrowLeft, FileText, User, Clock } from 'lucide-react';
import type { DocumentVersion } from '@/types';

interface VersionDetailProps {
    documentId: number;
    documentTitle: string;
    documentVersion: number;
    version: DocumentVersion;
    canEdit: boolean;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
}

export default function VersionDetail({ documentId, documentTitle, documentVersion, version, canEdit }: VersionDetailProps) {
    const [confirmRestore, setConfirmRestore] = useState(false);
    const isCurrentVersion = version.version_number === documentVersion;

    const handleRestore = () => {
        router.post(`/documents/${documentId}/versions/${version.id}/restore`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => router.get(`/documents/${documentId}/versions`)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to versions
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold dark:bg-slate-800">
                                v{version.version_number}
                            </div>
                            <div>
                                <CardTitle className="text-lg">
                                    Version {version.version_number}
                                    {isCurrentVersion && (
                                        <Badge className="ml-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                            Current
                                        </Badge>
                                    )}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">{documentTitle}</p>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                Created by
                            </div>
                            <p className="mt-1 font-medium">{version.creator.name}</p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                Created at
                            </div>
                            <p className="mt-1 font-medium">{formatDate(version.created_at)}</p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                File size
                            </div>
                            <p className="mt-1 font-medium">{version.formatted_size}</p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                Version number
                            </div>
                            <p className="mt-1 font-medium">v{version.version_number}</p>
                        </div>
                    </div>

                    {version.description && (
                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">Change Description</p>
                            <p className="mt-1">{version.description}</p>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.get(`/documents/${documentId}/versions/${version.id}/download`)}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download this version
                        </Button>

                        {canEdit && !isCurrentVersion && !confirmRestore && (
                            <Button
                                variant="outline"
                                className="text-amber-600 hover:text-amber-700"
                                onClick={() => setConfirmRestore(true)}
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Restore this version
                            </Button>
                        )}

                        {confirmRestore && (
                            <div className="flex items-center gap-2">
                                <Button variant="destructive" onClick={handleRestore}>
                                    Confirm Restore
                                </Button>
                                <Button variant="outline" onClick={() => setConfirmRestore(false)}>
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>

                    {isCurrentVersion && (
                        <p className="text-sm text-muted-foreground">
                            This is the current version of the document.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
