import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        is_public: false,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/spaces');
    }

    return (
        <>
            <Head title="Create Space" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Create Space</h1>
                    <p className="text-sm text-muted-foreground">Create a new collaborative space for your team.</p>
                </div>

                <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Space name"
                        />
                        <InputError message={errors.name} />
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

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            role="switch"
                            aria-checked={data.is_public}
                            onClick={() => setData('is_public', !data.is_public)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                                data.is_public ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                        >
                            <span
                                className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                                    data.is_public ? 'translate-x-4' : 'translate-x-0'
                                }`}
                            />
                        </button>
                        <div>
                            <Label>Make this space public</Label>
                            <p className="text-xs text-muted-foreground">Anyone can view this space</p>
                        </div>
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Creating...' : 'Create Space'}
                    </Button>
                </form>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Spaces', href: '/spaces' },
        { title: 'Create', href: '/spaces/create' },
    ],
};
