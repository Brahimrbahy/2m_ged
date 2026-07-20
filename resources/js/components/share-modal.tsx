import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PermissionIndicator from '@/components/permission-indicator';
import { UserPlus, X, Loader2 } from 'lucide-react';
import type { DocumentShare, PermissionLevel } from '@/types';

type ShareModalProps = {
    open: boolean;
    onClose: () => void;
    documentId: number;
    documentTitle: string;
    initialShares: DocumentShare[];
    canShare: boolean;
};

type UserResult = {
    id: number;
    name: string;
    email: string;
};

export default function ShareModal({ open, onClose, documentId, documentTitle, initialShares, canShare }: ShareModalProps) {
    const [shares, setShares] = useState<DocumentShare[]>(initialShares);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
    const [permission, setPermission] = useState<PermissionLevel>('view_only');
    const [expiresAt, setExpiresAt] = useState('');
    const [sharing, setSharing] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

    useEffect(() => {
        if (!open) {
            setShares(initialShares);
            setSearchQuery('');
            setSelectedUser(null);
            setSearchResults([]);
            setShowSearch(false);
        }
    }, [open, initialShares]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearch(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleSearchChange(value: string) {
        setSearchQuery(value);
        setSelectedUser(null);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (value.length < 2) {
            setSearchResults([]);
            setShowSearch(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`/search/instant?q=${encodeURIComponent(value)}&type=users`);
                const data = await res.json();
                setSearchResults(data.users || []);
                setShowSearch(true);
            } catch {
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);
    }

    function selectUser(user: UserResult) {
        setSelectedUser(user);
        setSearchQuery(user.name);
        setShowSearch(false);
    }

    async function handleShare() {
        if (!selectedUser) return;

        setSharing(true);
        try {
            const res = await fetch(`/documents/${documentId}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || '',
                },
                body: JSON.stringify({
                    shared_with_user_id: selectedUser.id,
                    permission_level: permission,
                    expires_at: expiresAt || null,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setShares((prev) => {
                    const existing = prev.findIndex((s) => s.user.id === selectedUser.id);
                    if (existing >= 0) {
                        const updated = [...prev];
                        updated[existing] = data.share;
                        return updated;
                    }
                    return [...prev, data.share];
                });
                setSearchQuery('');
                setSelectedUser(null);
                setPermission('view_only');
                setExpiresAt('');
                router.reload({ only: ['document'] });
            }
        } catch {
            // silently fail
        } finally {
            setSharing(false);
        }
    }

    async function handleRemoveShare(share: DocumentShare) {
        try {
            const res = await fetch(`/documents/${documentId}/shares/${share.user.id}`, {
                method: 'DELETE',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || '',
                },
            });

            if (res.ok) {
                setShares((prev) => prev.filter((s) => s.id !== share.id));
                router.reload({ only: ['document'] });
            }
        } catch {
            // silently fail
        }
    }

    function handleCopyLink() {
        navigator.clipboard.writeText(window.location.origin + '/documents/' + documentId);
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share "{documentTitle}"</DialogTitle>
                    <DialogDescription>
                        Grant access to other users with specific permission levels.
                    </DialogDescription>
                </DialogHeader>

                {canShare && (
                    <div className="space-y-4">
                        <div className="relative" ref={searchRef}>
                            <Label htmlFor="user-search">Search users</Label>
                            <div className="relative mt-1">
                                <Input
                                    id="user-search"
                                    placeholder="Type a name or email..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    onFocus={() => searchResults.length > 0 && setShowSearch(true)}
                                />
                                {searching && (
                                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                                )}
                            </div>

                            {showSearch && searchResults.length > 0 && (
                                <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-lg border bg-white shadow-lg dark:bg-slate-900">
                                    {searchResults.map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => selectUser(user)}
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-medium dark:bg-slate-700">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium">{user.name}</p>
                                                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {showSearch && searchResults.length === 0 && !searching && searchQuery.length >= 2 && (
                                <div className="absolute top-full z-50 mt-1 w-full rounded-lg border bg-white p-4 text-center text-sm text-muted-foreground shadow-lg dark:bg-slate-900">
                                    No users found
                                </div>
                            )}
                        </div>

                        {selectedUser && (
                            <div className="rounded-lg border bg-slate-50 p-3 dark:bg-slate-800">
                                <p className="text-sm font-medium">{selectedUser.name}</p>
                                <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                            </div>
                        )}

                        <div>
                            <Label>Permission Level</Label>
                            <Select value={permission} onValueChange={(v) => setPermission(v as PermissionLevel)}>
                                <SelectTrigger className="mt-1 w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="view_only">View Only</SelectItem>
                                    <SelectItem value="can_comment">Can Comment</SelectItem>
                                    <SelectItem value="can_edit">Can Edit</SelectItem>
                                    <SelectItem value="can_delete">Can Delete</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="expires-at">Expiration Date (optional)</Label>
                            <Input
                                id="expires-at"
                                type="date"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                className="mt-1"
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <Button onClick={handleShare} disabled={!selectedUser || sharing} className="w-full">
                            {sharing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <UserPlus className="mr-2 h-4 w-4" />
                            )}
                            Share
                        </Button>
                    </div>
                )}

                {shares.length > 0 && (
                    <div className="space-y-2">
                        <Label>People with access</Label>
                        <div className="space-y-2">
                            {shares.map((share) => (
                                <div key={share.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-medium dark:bg-slate-700">
                                            {share.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{share.user.name}</p>
                                            <p className="text-xs text-muted-foreground">{share.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <PermissionIndicator permission={share.permission_level} />
                                        {canShare && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => handleRemoveShare(share)}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={handleCopyLink} className="mr-auto">
                        Copy link
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
