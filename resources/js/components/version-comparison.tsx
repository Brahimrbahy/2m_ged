import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Minus, Plus } from 'lucide-react';
import type { DocumentVersion } from '@/types';

interface VersionComparisonProps {
    oldVersion: DocumentVersion;
    newVersion: DocumentVersion;
    onClose?: () => void;
}

export default function VersionComparison({ oldVersion, newVersion, onClose }: VersionComparisonProps) {
    const sizeDiff = newVersion.file_size - oldVersion.file_size;
    const sizeDiffFormatted = formatSizeDiff(sizeDiff);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ArrowLeftRight className="h-4 w-4" />
                        Version Comparison
                    </CardTitle>
                    {onClose && (
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            Close
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Property</p>
                    </div>
                    <div className="rounded-lg border bg-slate-50 p-3 dark:bg-slate-900">
                        <p className="text-xs text-muted-foreground">v{oldVersion.version_number} (Old)</p>
                    </div>
                    <div className="rounded-lg border bg-blue-50 p-3 dark:bg-blue-950">
                        <p className="text-xs text-muted-foreground">v{newVersion.version_number} (New)</p>
                    </div>

                    <div className="border p-3 font-medium">Author</div>
                    <div className="border p-3">{oldVersion.creator.name}</div>
                    <div className="border p-3">{newVersion.creator.name}</div>

                    <div className="border p-3 font-medium">File Size</div>
                    <div className="border p-3">{oldVersion.formatted_size}</div>
                    <div className="border p-3">
                        {newVersion.formatted_size}
                        {sizeDiff !== 0 && (
                            <span className={`ml-2 text-xs ${sizeDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {sizeDiff > 0 ? '+' : ''}{sizeDiffFormatted}
                            </span>
                        )}
                    </div>

                    <div className="border p-3 font-medium">Description</div>
                    <div className="border p-3 text-muted-foreground">{oldVersion.description || '-'}</div>
                    <div className="border p-3 text-muted-foreground">{newVersion.description || '-'}</div>

                    <div className="border p-3 font-medium">Date</div>
                    <div className="border p-3">{new Date(oldVersion.created_at).toLocaleDateString()}</div>
                    <div className="border p-3">{new Date(newVersion.created_at).toLocaleDateString()}</div>
                </div>

                <div className="mt-4 rounded-lg border p-3 text-sm">
                    <p className="text-xs text-muted-foreground mb-1">Summary</p>
                    <div className="flex items-center gap-4">
                        {sizeDiff > 0 && (
                            <span className="flex items-center gap-1 text-green-600">
                                <Plus className="h-3 w-3" />
                                File grew by {sizeDiffFormatted}
                            </span>
                        )}
                        {sizeDiff < 0 && (
                            <span className="flex items-center gap-1 text-red-600">
                                <Minus className="h-3 w-3" />
                                File reduced by {sizeDiffFormatted}
                            </span>
                        )}
                        {sizeDiff === 0 && (
                            <span className="text-muted-foreground">No file size change</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function formatSizeDiff(bytes: number): string {
    const abs = Math.abs(bytes);
    if (abs >= 1073741824) return (abs / 1073741824).toFixed(2) + ' GB';
    if (abs >= 1048576) return (abs / 1048576).toFixed(2) + ' MB';
    if (abs >= 1024) return (abs / 1024).toFixed(2) + ' KB';
    return abs + ' B';
}
