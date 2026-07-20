import { router } from '@inertiajs/react';
import { useCallback, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';
import type { ImportResult } from '@/types';

interface BulkImportModalProps {
    open: boolean;
    onClose: () => void;
    onImportComplete: (result: ImportResult) => void;
}

type ParsedRow = {
    email: string;
    full_name: string;
    department: string;
    role: string;
    valid: boolean;
    error?: string;
};

function parseCSV(text: string): { headers: string[]; rows: ParsedRow[] } {
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        const data: Record<string, string> = {};
        headers.forEach((h, idx) => {
            data[h] = values[idx] ?? '';
        });

        const email = data.email ?? '';
        const full_name = data.full_name ?? data.fullname ?? data.name ?? '';
        const department = data.department ?? '';
        const role = (data.role ?? 'user').toLowerCase();

        const errors: string[] = [];
        if (!email) errors.push('Missing email');
        if (!full_name) errors.push('Missing full_name');
        if (email && !email.includes('@')) errors.push('Invalid email');
        if (role && !['admin', 'manager', 'user'].includes(role)) errors.push('Invalid role');

        rows.push({
            email,
            full_name,
            department,
            role: ['admin', 'manager', 'user'].includes(role) ? role : 'user',
            valid: errors.length === 0,
            error: errors.join(', '),
        });
    }

    return { headers, rows };
}

export default function BulkImportModal({ open, onClose, onImportComplete }: BulkImportModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [csvData, setCsvData] = useState<{ headers: string[]; rows: ParsedRow[] } | null>(null);
    const [fileName, setFileName] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setCsvData(parseCSV(text));
        };
        reader.readAsText(file);
    }, []);

    const handleImport = () => {
        if (!csvData) return;

        const file = fileInputRef.current?.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('csv_file', file);

        router.post('/admin/users/import', formData, {
            onFinish: () => setUploading(false),
            onSuccess: () => {
                onClose();
                setCsvData(null);
                setFileName('');
            },
        });
    };

    const validCount = csvData?.rows.filter((r) => r.valid).length ?? 0;
    const invalidCount = csvData?.rows.filter((r) => !r.valid).length ?? 0;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Bulk Import Users</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file with columns: email, full_name, department, role
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
                    <div
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">
                            {fileName || 'Click to select a CSV file'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Max 5MB. Supports .csv and .txt files.
                        </p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.txt"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {csvData && csvData.rows.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1.5 text-green-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {validCount} valid
                                </span>
                                {invalidCount > 0 && (
                                    <span className="flex items-center gap-1.5 text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {invalidCount} invalid
                                    </span>
                                )}
                            </div>

                            <div className="rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium">Email</th>
                                            <th className="px-3 py-2 text-left font-medium">Full Name</th>
                                            <th className="px-3 py-2 text-left font-medium">Department</th>
                                            <th className="px-3 py-2 text-left font-medium">Role</th>
                                            <th className="px-3 py-2 text-left font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {csvData.rows.map((row, i) => (
                                            <tr
                                                key={i}
                                                className={`${row.valid ? '' : 'bg-destructive/5'}`}
                                            >
                                                <td className="px-3 py-2 font-mono text-xs">{row.email}</td>
                                                <td className="px-3 py-2">{row.full_name}</td>
                                                <td className="px-3 py-2 text-muted-foreground">{row.department || '-'}</td>
                                                <td className="px-3 py-2">
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                        {row.role}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    {row.valid ? (
                                                        <span className="text-green-600 text-xs">OK</span>
                                                    ) : (
                                                        <span className="text-destructive text-xs" title={row.error}>
                                                            {row.error}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!csvData || validCount === 0 || uploading}
                    >
                        {uploading ? 'Importing...' : `Import ${validCount} Users`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
