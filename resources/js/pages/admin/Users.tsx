import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import {
    Users,
    Search,
    UserPlus,
    Upload,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import EditUserModal from '@/components/edit-user-modal';
import BulkImportModal from '@/components/bulk-import-modal';
import type { AdminUser, PaginatedUsers, ImportResult } from '@/types';

type Props = {
    users: PaginatedUsers;
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
};

export default function AdminUsers({ users, filters }: Props) {
    const { importResult } = usePage().props as { importResult?: ImportResult };

    const roleBadgeColors: Record<string, string> = {
        admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        manager: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        user: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    };

    const statusBadgeColors: Record<string, string> = {
        active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        inactive: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };

    const [search, setSearch] = useState(filters.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters.role ?? 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

    const handleSearch = () => {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (roleFilter && roleFilter !== 'all') params.role = roleFilter;
        if (statusFilter && statusFilter !== 'all') params.status = statusFilter;

        router.get('/admin/users', params, { preserveState: true });
    };

    const handleRoleFilter = (value: string) => {
        setRoleFilter(value);
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (value && value !== 'all') params.role = value;
        if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
        router.get('/admin/users', params, { preserveState: true });
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (roleFilter && roleFilter !== 'all') params.role = roleFilter;
        if (value && value !== 'all') params.status = value;
        router.get('/admin/users', params, { preserveState: true });
    };

    const handleEdit = (user: AdminUser) => {
        setEditingUser(user);
        setEditModalOpen(true);
    };

    const handleDeactivate = (user: AdminUser) => {
        setDeletingUser(user);
    };

    const confirmDeactivate = () => {
        if (!deletingUser) return;
        router.delete(`/admin/users/${deletingUser.id}`);
        setDeletingUser(null);
    };

    const handlePageChange = (page: number) => {
        const params: Record<string, string | number> = { page };
        if (search) params.search = search;
        if (roleFilter && roleFilter !== 'all') params.role = roleFilter;
        if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
        router.get('/admin/users', params, { preserveState: true });
    };

    return (
        <>
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                            <Users className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">User Management</h1>
                            <p className="text-sm text-muted-foreground">
                                {users.total} total users
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Import CSV
                        </Button>
                    </div>
                </div>

                {importResult && (
                    <div className={`rounded-lg border p-4 text-sm ${importResult.success ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : 'bg-destructive/10 border-destructive/20'}`}>
                        <p className="font-medium">{importResult.message}</p>
                        {importResult.errors.length > 0 && (
                            <ul className="mt-2 list-disc list-inside text-xs text-muted-foreground">
                                {importResult.errors.slice(0, 10).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                                {importResult.errors.length > 10 && (
                                    <li>...and {importResult.errors.length - 10} more errors</li>
                                )}
                            </ul>
                        )}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by email or name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-9"
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={handleRoleFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={handleStatusFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={handleSearch}>
                        Search
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Email</th>
                                        <th className="px-4 py-3 text-left font-medium">Full Name</th>
                                        <th className="px-4 py-3 text-left font-medium">Department</th>
                                        <th className="px-4 py-3 text-left font-medium">Role</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-left font-medium">Joined</th>
                                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user) => (
                                            <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs">{user.email}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{user.full_name || user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{user.department || '-'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeColors[user.role] ?? ''}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeColors[user.status] ?? ''}`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(user)}
                                                            title="Edit"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        {user.status === 'active' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeactivate(user)}
                                                                title="Deactivate"
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {users.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {((users.current_page - 1) * users.per_page) + 1} to{' '}
                            {Math.min(users.current_page * users.per_page, users.total)} of {users.total} users
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={users.current_page === 1}
                                onClick={() => handlePageChange(users.current_page - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {users.current_page} of {users.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={users.current_page === users.last_page}
                                onClick={() => handlePageChange(users.current_page + 1)}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <EditUserModal
                user={editingUser}
                open={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setEditingUser(null);
                }}
            />

            <BulkImportModal
                open={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onImportComplete={() => {}}
            />

            <Dialog open={!!deletingUser} onOpenChange={(isOpen) => !isOpen && setDeletingUser(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Deactivate User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to deactivate <strong>{deletingUser?.full_name || deletingUser?.email}</strong>? They will no longer be able to log in.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingUser(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDeactivate}>
                            Deactivate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminUsers.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'User Management', href: '/admin/users' },
    ],
};
