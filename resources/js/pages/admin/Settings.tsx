import { Head, useForm } from '@inertiajs/react';
import { Building2, FileText, FolderOpen, Save, Users } from 'lucide-react';
import RoleGuard from '@/components/role-guard';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { AdminSettings } from '@/types';

type Props = {
    settings: AdminSettings;
};

export default function AdminSettings({ settings }: Props) {
    const { data, setData, put, processing, errors } = useForm({ ...settings });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/settings');
    };

    return (
        <RoleGuard requiredRole="admin">
            <Head title="System Settings" />
            <form
                onSubmit={handleSubmit}
                className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            System Settings
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Configure system-wide settings and preferences.
                        </p>
                    </div>
                    <Button type="submit" disabled={processing}>
                        <Save className="mr-2 h-4 w-4" />
                        {processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Building2 className="h-4 w-4" />
                                General
                            </CardTitle>
                            <CardDescription>
                                App identity and regional preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="app-name">
                                    Application Name
                                </Label>
                                <Input
                                    id="app-name"
                                    value={data.app.name}
                                    onChange={(e) =>
                                        setData('app.name', e.target.value)
                                    }
                                    placeholder="2M GED"
                                />
                                {errors['app.name'] && (
                                    <p className="text-xs text-destructive">
                                        {errors['app.name']}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="support-email">
                                    Support Email
                                </Label>
                                <Input
                                    id="support-email"
                                    type="email"
                                    value={data.app.support_email}
                                    onChange={(e) =>
                                        setData(
                                            'app.support_email',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="support@example.com"
                                />
                                {errors['app.support_email'] && (
                                    <p className="text-xs text-destructive">
                                        {errors['app.support_email']}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Default Language</Label>
                                    <Select
                                        value={data.app.default_locale}
                                        onValueChange={(v) =>
                                            setData('app.default_locale', v)
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">
                                                English
                                            </SelectItem>
                                            <SelectItem value="fr">
                                                French
                                            </SelectItem>
                                            <SelectItem value="ar">
                                                Arabic
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Date Format</Label>
                                    <Select
                                        value={data.app.date_format}
                                        onValueChange={(v) =>
                                            setData('app.date_format', v)
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Y-m-d">
                                                2026-08-05
                                            </SelectItem>
                                            <SelectItem value="d/m/Y">
                                                05/08/2026
                                            </SelectItem>
                                            <SelectItem value="m/d/Y">
                                                08/05/2026
                                            </SelectItem>
                                            <SelectItem value="d M Y">
                                                05 Aug 2026
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4" />
                                Documents
                            </CardTitle>
                            <CardDescription>
                                Upload limits and accepted file types.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="max-upload-size">
                                    Maximum Upload Size (MB)
                                </Label>
                                <Input
                                    id="max-upload-size"
                                    type="number"
                                    min={1}
                                    max={5120}
                                    value={data.documents.max_upload_size}
                                    onChange={(e) =>
                                        setData(
                                            'documents.max_upload_size',
                                            Number(e.target.value),
                                        )
                                    }
                                />
                                {errors['documents.max_upload_size'] && (
                                    <p className="text-xs text-destructive">
                                        {errors['documents.max_upload_size']}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="allowed-file-types">
                                    Allowed File Types
                                </Label>
                                <Input
                                    id="allowed-file-types"
                                    value={data.documents.allowed_file_types}
                                    onChange={(e) =>
                                        setData(
                                            'documents.allowed_file_types',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="pdf,doc,docx,xls,xlsx..."
                                />
                                <p className="text-xs text-muted-foreground">
                                    Comma-separated extensions, e.g.
                                    pdf,doc,docx,xls,xlsx.
                                </p>
                                {errors['documents.allowed_file_types'] && (
                                    <p className="text-xs text-destructive">
                                        {errors['documents.allowed_file_types']}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FolderOpen className="h-4 w-4" />
                                Spaces & Storage
                            </CardTitle>
                            <CardDescription>
                                Default space behavior and storage limits.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Default Space Visibility</Label>
                                <Select
                                    value={data.spaces.default_visibility}
                                    onValueChange={(v) =>
                                        setData(
                                            'spaces.default_visibility',
                                            v as 'public' | 'private',
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="private">
                                            Private
                                        </SelectItem>
                                        <SelectItem value="public">
                                            Public
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="storage-quota">
                                    Per-User Storage Quota (MB)
                                </Label>
                                <Input
                                    id="storage-quota"
                                    type="number"
                                    min={0}
                                    value={data.spaces.user_storage_quota}
                                    onChange={(e) =>
                                        setData(
                                            'spaces.user_storage_quota',
                                            Number(e.target.value),
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Set to 0 for unlimited storage.
                                </p>
                                {errors['spaces.user_storage_quota'] && (
                                    <p className="text-xs text-destructive">
                                        {errors['spaces.user_storage_quota']}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="h-4 w-4" />
                                Users & Registration
                            </CardTitle>
                            <CardDescription>
                                Registration and default account behavior.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <Label>Allow Self-Registration</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Let new users create their own accounts.
                                    </p>
                                </div>
                                <Checkbox
                                    checked={data.users.allow_registration}
                                    onCheckedChange={(v) =>
                                        setData('users.allow_registration', !!v)
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <Label>Require Email Verification</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Require users to verify their email
                                        before logging in.
                                    </p>
                                </div>
                                <Checkbox
                                    checked={
                                        data.users.require_email_verification
                                    }
                                    onCheckedChange={(v) =>
                                        setData(
                                            'users.require_email_verification',
                                            !!v,
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Default Role for New Users</Label>
                                <Select
                                    value={data.users.default_role}
                                    onValueChange={(v) =>
                                        setData(
                                            'users.default_role',
                                            v as 'admin' | 'manager' | 'user',
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">
                                            User
                                        </SelectItem>
                                        <SelectItem value="manager">
                                            Manager
                                        </SelectItem>
                                        <SelectItem value="admin">
                                            Admin
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </RoleGuard>
    );
}

AdminSettings.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Settings', href: '/admin/settings' },
    ],
};
