import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function VentasPageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="space-y-2 w-full sm:w-auto">
                    <div className="h-8 bg-slate-200 rounded w-64"></div>
                    <div className="h-4 bg-slate-200 rounded w-48"></div>
                </div>
            </div>

            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-slate-200 rounded w-20"></div>
                                    <div className="h-6 bg-slate-200 rounded w-28"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters skeleton */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-10 bg-slate-200 rounded"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Table skeleton (Desktop) */}
            <div className="hidden md:block">
                <Card>
                    <CardContent className="p-0">
                        <div className="p-4 space-y-4">
                            {/* Header row */}
                            <div className="grid grid-cols-7 gap-4 pb-3 border-b">
                                <div className="h-4 bg-slate-200 rounded"></div>
                                <div className="h-4 bg-slate-200 rounded"></div>
                                <div className="h-4 bg-slate-200 rounded"></div>
                                <div className="h-4 bg-slate-200 rounded"></div>
                                <div className="h-4 bg-slate-200 rounded"></div>
                                <div className="h-4 bg-slate-200 rounded"></div>
                                <div className="h-4 bg-slate-200 rounded"></div>
                            </div>
                            {/* Data rows */}
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="grid grid-cols-7 gap-4">
                                    <div className="h-4 bg-slate-200 rounded"></div>
                                    <div className="h-4 bg-slate-200 rounded"></div>
                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-200 rounded"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Cards skeleton (Mobile) */}
            <div className="md:hidden grid gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between">
                                <div className="space-y-2">
                                    <div className="h-6 bg-slate-200 rounded w-20"></div>
                                    <div className="h-4 bg-slate-200 rounded w-32"></div>
                                </div>
                                <div className="h-8 bg-slate-200 rounded w-24"></div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                            <div className="flex gap-2 pt-2">
                                <div className="h-8 bg-slate-200 rounded flex-1"></div>
                                <div className="h-8 bg-slate-200 rounded w-20"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

