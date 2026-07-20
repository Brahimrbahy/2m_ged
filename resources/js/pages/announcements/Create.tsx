import { router, Head } from '@inertiajs/react';
import { useState } from 'react';
import RichEditor from '@/components/rich-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Save, X } from 'lucide-react';

type SpaceOption = { id: number; name: string };

type Props = {
    spaces: SpaceOption[];
};

export default function AnnouncementCreate({ spaces }: Props) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'draft' | 'published'>('published');
    const [targetSpaceId, setTargetSpaceId] = useState<number | null>(null);
    const [isPinned, setIsPinned] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        router.post('/announcements', {
            title,
            content,
            status,
            target_space_id: targetSpaceId,
            is_pinned: isPinned,
        }, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <>
            <Head title="New Announcement" />
            <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                            <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">New Announcement</h1>
                            <p className="text-sm text-muted-foreground">Share an update with your team</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.visit('/announcements')}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. New Document Management Features"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Content *</Label>
                                <RichEditor
                                    value={content}
                                    onChange={setContent}
                                    placeholder="Write your announcement..."
                                    minHeight="250px"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setStatus('published')}
                                            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                                                status === 'published'
                                                    ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300'
                                                    : 'border-input text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <Badge variant="outline" className="mr-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                                Published
                                            </Badge>
                                            Visible to everyone
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStatus('draft')}
                                            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                                                status === 'draft'
                                                    ? 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                                    : 'border-input text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <Badge variant="outline" className="mr-1">Draft</Badge>
                                            Only visible to you
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Target Space (optional)</Label>
                                    <select
                                        value={targetSpaceId ?? ''}
                                        onChange={(e) => setTargetSpaceId(e.target.value ? Number(e.target.value) : null)}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="">All spaces</option>
                                        {spaces.map((space) => (
                                            <option key={space.id} value={space.id}>{space.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_pinned"
                                    checked={isPinned}
                                    onChange={(e) => setIsPinned(e.target.checked)}
                                    className="h-4 w-4 rounded border-input"
                                />
                                <Label htmlFor="is_pinned" className="text-sm">Pin this announcement to the top</Label>
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-4">
                                <Button type="button" variant="outline" onClick={() => router.visit('/announcements')}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={!title || !content || submitting}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {submitting ? 'Publishing...' : 'Publish Announcement'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}
