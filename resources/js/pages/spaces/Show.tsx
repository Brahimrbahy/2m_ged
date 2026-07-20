import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import type { SpaceDetail, SpaceMember } from '@/types';

interface ShowProps {
    space: SpaceDetail;
    availableUsers: { id: number; name: string; email: string }[];
}

const roleBadgeClasses: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    contributor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    viewer: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
};

const statusConfig: Record<string, { label: string; className: string }> = {
    published: { label: 'Published', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    draft: { label: 'Draft', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    archived: { label: 'Archived', className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
};

export default function Show({ space, availableUsers }: ShowProps) {
    const { auth } = usePage().props;
    const canEdit = space.user_role === 'admin' || space.user_role === 'contributor';
    const isCreator = auth.user?.id === space.creator.id;

    const { data: addMemberData, setData: setAddMemberData, post: postMember, processing: addingMember, errors: addMemberErrors } = useForm({
        user_id: '',
        role: 'viewer' as string,
    });

    function handleAddMember(e: React.FormEvent) {
        e.preventDefault();
        postMember(`/spaces/${space.id}/members`, {
            onSuccess: () => setAddMemberData('user_id', ''),
        });
    }

    function handleRemoveMember(userId: number) {
        if (confirm('Remove this member from the space?')) {
            router.delete(`/spaces/${space.id}/members/${userId}`);
        }
    }

    function handleDelete() {
        if (confirm('Are you sure you want to delete this space? All documents will be unlinked.')) {
            router.delete(`/spaces/${space.id}`);
        }
    }

    return (
        <>
            <Head title={space.name} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl">📁</span>
                            <h1 className="text-2xl font-semibold tracking-tight">{space.name}</h1>
                            {space.is_public && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                                    Public
                                </Badge>
                            )}
                        </div>
                        {space.description && (
                            <p className="mt-1 text-sm text-muted-foreground">{space.description}</p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                            Created by {space.creator.name} — {space.document_count} documents
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {canEdit && (
                            <Button variant="outline" size="sm" onClick={() => router.get(`/spaces/${space.id}/edit`)}>
                                Edit
                            </Button>
                        )}
                        {isCreator && (
                            <Button variant="destructive" size="sm" onClick={handleDelete}>
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Members */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Members ({space.members.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {space.members.map((member: SpaceMember) => (
                                    <div key={member.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">{member.name}</p>
                                            <p className="text-xs text-muted-foreground">{member.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={roleBadgeClasses[member.role]}>
                                                {member.role}
                                            </Badge>
                                            {canEdit && member.id !== space.creator.id && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                                                    onClick={() => handleRemoveMember(member.id)}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {canEdit && availableUsers.length > 0 && (
                                    <form onSubmit={handleAddMember} className="mt-4 space-y-2 border-t pt-3">
                                        <p className="text-xs font-medium text-muted-foreground">Add Member</p>
                                        <select
                                            value={addMemberData.user_id}
                                            onChange={(e) => setAddMemberData('user_id', e.target.value)}
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"
                                        >
                                            <option value="">Select a user...</option>
                                            {availableUsers.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={addMemberData.role}
                                            onChange={(e) => setAddMemberData('role', e.target.value)}
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"
                                        >
                                            <option value="viewer">Viewer</option>
                                            <option value="contributor">Contributor</option>
                                        </select>
                                        <InputError message={addMemberErrors.user_id} />
                                        <Button type="submit" size="sm" disabled={addingMember || !addMemberData.user_id}>
                                            {addingMember ? 'Adding...' : 'Add'}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Documents */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Documents ({space.documents.length})</CardTitle>
                                    {canEdit && (
                                        <Button size="sm" onClick={() => router.get('/documents/create')}>
                                            Upload
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {space.documents.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        No documents in this space yet.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {space.documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{doc.icon}</span>
                                                    <div>
                                                        <p className="text-sm font-medium">{doc.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {doc.formatted_size} — v{doc.version} — by {doc.uploader.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={statusConfig[doc.status]?.className}>
                                                        {statusConfig[doc.status]?.label}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.get(`/documents/${doc.id}`)}
                                                    >
                                                        Open
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Spaces', href: '/spaces' },
        { title: 'Details', href: '' },
    ],
};
