import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Users,
    Search,
    UserPlus,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
    Mail,
    Shield,
} from 'lucide-react';
import { useInitials } from '@/hooks/use-initials';
import type { AdminUser, PaginatedUsers } from '@/types';

type Props = {
    users: PaginatedUsers;
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
};

const roleBadgeColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    user: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const statusBadgeColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    inactive: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
};

export default function ManagerUsers({ users, filters }: Props) {
    const getInitials = useInitials();

    const [search, setSearch] = useState(filters.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters.role ?? 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        role: 'user' as 'user' | 'manager',
        department: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const applyFilters = (overrides?: Record<string, string>) => {
        const params: Record<string, string> = {};
        const s = overrides?.search ?? search;
        const r = overrides?.role ?? roleFilter;
        const st = overrides?.status ?? statusFilter;
        if (s) params.search = s;
        if (r && r !== 'all') params.role = r;
        if (st && st !== 'all') params.status = st;
        router.get('/manager/users', params, { preserveState: true });
    };

    const handleRoleFilter = (value: string) => {
        setRoleFilter(value);
        applyFilters({ role: value });
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        applyFilters({ status: value });
    };

    const confirmDeactivate = () => {
        if (!deletingUser) return;
        router.delete(`/manager/users/${deletingUser.id}`);
        setDeletingUser(null);
    };

    const handleAddUser = () => {
        setFormErrors({});
        router.post('/manager/users', formData, {
            onSuccess: () => {
                setAddDialogOpen(false);
                setFormData({ full_name: '', email: '', role: 'user', department: '' });
            },
            onError: (errors) => {
                setFormErrors(errors);
            },
        });
    };

    const handlePageChange = (page: number) => {
        const params: Record<string, string | number> = { page };
        if (search) params.search = search;
        if (roleFilter && roleFilter !== 'all') params.role = roleFilter;
        if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
        router.get('/manager/users', params, { preserveState: true });
    };

    return (
        <>
            <Head title="Team Members" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Team Members</h1>
                            <p className="text-sm text-muted-foreground">
                                {users.total} member{users.total !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => setAddDialogOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[200px] flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or department..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            className="pl-9"
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={handleRoleFilter}>
                        <SelectTrigger className="w-[130px]">
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
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearch('');
                            setRoleFilter('all');
                            setStatusFilter('all');
                            router.get('/manager/users', {}, { preserveState: true });
                        }}
                        className="text-muted-foreground"
                    >
                        <X className="mr-1 h-4 w-4" />
                        Clear
                    </Button>
                </div>

                {/* Users List */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Member</th>
                                        <th className="px-4 py-3 text-left font-medium">Role</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-left font-medium">Department</th>
                                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-16 text-center text-muted-foreground"
                                            >
                                                <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                                                <p className="font-medium">No team members found</p>
                                                <p className="mt-1 text-xs">
                                                    Try adjusting your search or filters.
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="group transition-colors hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 border border-border/50">
                                                            <AvatarFallback
                                                                className={`text-xs font-medium ${
                                                                    user.role === 'admin'
                                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                                                        : user.role === 'manager'
                                                                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                                                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                                }`}
                                                            >
                                                                {getInitials(
                                                                    user.full_name ||
                                                                        user.name,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {user.full_name ?? user.name}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Mail className="h-3 w-3" />
                                                                {user.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeColors[user.role] ?? ''}`}
                                                    >
                                                        <Shield className="h-3 w-3" />
                                                        {user.role.charAt(0).toUpperCase() +
                                                            user.role.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeColors[user.status] ?? ''}`}
                                                    >
                                                        <span
                                                            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                                                user.status === 'active'
                                                                    ? 'bg-green-500'
                                                                    : 'bg-red-500'
                                                            }`}
                                                        />
                                                        {user.status.charAt(0).toUpperCase() +
                                                            user.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {user.department || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDeletingUser(user)}
                                                            title="Remove member"
                                                            className="text-muted-foreground hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
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

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing{' '}
                            {(users.current_page - 1) * users.per_page + 1} to{' '}
                            {Math.min(
                                users.current_page * users.per_page,
                                users.total,
                            )}{' '}
                            of {users.total} members
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={users.current_page === 1}
                                onClick={() =>
                                    handlePageChange(users.current_page - 1)
                                }
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
                                disabled={
                                    users.current_page === users.last_page
                                }
                                onClick={() =>
                                    handlePageChange(users.current_page + 1)
                                }
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add User Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                        <DialogDescription>
                            Invite a new member to the team. They'll receive an
                            email with instructions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Full Name
                            </label>
                            <Input
                                placeholder="e.g. Jane Smith"
                                value={formData.full_name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        full_name: e.target.value,
                                    })
                                }
                            />
                            {formErrors.full_name && (
                                <p className="text-xs text-destructive">
                                    {formErrors.full_name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                placeholder="e.g. jane@company.com"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                            />
                            {formErrors.email && (
                                <p className="text-xs text-destructive">
                                    {formErrors.email}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Role</label>
                            <Select
                                value={formData.role}
                                onValueChange={(
                                    v: 'user' | 'manager',
                                ) =>
                                    setFormData({ ...formData, role: v })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="manager">
                                        Manager
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {formErrors.role && (
                                <p className="text-xs text-destructive">
                                    {formErrors.role}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Department{' '}
                                <span className="text-muted-foreground">
                                    (optional)
                                </span>
                            </label>
                            <Input
                                placeholder="e.g. Engineering"
                                value={formData.department}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        department: e.target.value,
                                    })
                                }
                            />
                            {formErrors.department && (
                                <p className="text-xs text-destructive">
                                    {formErrors.department}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setAddDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAddUser}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Member
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!deletingUser}
                onOpenChange={(isOpen) => !isOpen && setDeletingUser(null)}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Remove Team Member</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to deactivate{' '}
                            <strong>
                                {deletingUser?.full_name ?? deletingUser?.email}
                            </strong>
                            ? They will no longer be able to log in.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback
                                className={`text-xs font-medium ${
                                    deletingUser?.role === 'admin'
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                        : deletingUser?.role === 'manager'
                                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                            >
                                {getInitials(
                                    deletingUser?.full_name ??
                                        deletingUser?.name ??
                                        '',
                                )}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">
                                {deletingUser?.full_name ?? deletingUser?.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {deletingUser?.email}
                            </span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeletingUser(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeactivate}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ManagerUsers.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manager', href: '/manager/dashboard' },
        { title: 'Team Members', href: '/manager/users' },
    ],
};
