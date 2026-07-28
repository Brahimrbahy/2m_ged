import { Head, useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { File, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

export default function Upload() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const { data, setData, post, processing, progress, errors, reset } = useForm({
        title: '',
        description: '',
        file: null as File | null,
    });

    function handleFileSelect(file: File | null) {
        if (!file) return;
        setData('file', file);
        if (!data.title) {
            const name = file.name.replace(/\.[^/.]+$/, '');
            setData('title', name);
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/documents', {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    }

    function formatFileSize(bytes: number): string {
        if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return bytes + ' B';
    }

    return (
        <>
            <Head title="Upload Document" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Upload Document</h1>
                    <p className="text-sm text-muted-foreground">Upload a new document to your workspace.</p>
                </div>

                <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Document title"
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Optional description"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="space-y-2">
                        <Label>File</Label>
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-solid p-8 text-center transition-colors ${
                                isDragging
                                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950'
                                    : 'border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600'
                            }`}
                        >
                            {data.file ? (
                                <div className="flex flex-col items-center gap-2">
                                    <File className="h-8 w-8 text-muted-foreground" />
                                    <p className="font-medium">{data.file.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatFileSize(data.file.size)}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setData('file', null);
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Folder className="h-10 w-10 text-muted-foreground" />
                                    <p className="font-medium">Drag and drop your file here</p>
                                    <p className="text-sm text-muted-foreground">
                                        or click to browse
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        PDF, DOCX, XLSX, PPTX, JPG, PNG, GIF — Max 50MB
                                    </p>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                        />
                        <InputError message={errors.file} />
                    </div>

                    {progress && (
                        <div className="space-y-1">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                <div
                                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                                    style={{ width: `${progress.percentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">{progress.percentage}% uploaded</p>
                        </div>
                    )}

                    <Button type="submit" disabled={processing || !data.file}>
                        {processing ? 'Uploading...' : 'Upload Document'}
                    </Button>
                </form>
            </div>
        </>
    );
}

Upload.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Documents', href: '/documents' },
        { title: 'Upload', href: '/documents/create' },
    ],
};
