import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: number;
    icon: LucideIcon;
}

export default function StatCard({ label, value, icon: Icon }: StatCardProps) {
    return (
        <Card className="transition-shadow hover:shadow-lg">
            <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                    <Icon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                    <p className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}
