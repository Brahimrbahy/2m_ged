import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
    label: string;
    value: number;
    icon: string;
}

export default function StatCard({ label, value, icon }: StatCardProps) {
    return (
        <Card className="transition-shadow hover:shadow-lg">
            <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-2xl dark:bg-slate-800">
                    {icon}
                </div>
                <div>
                    <p className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}
