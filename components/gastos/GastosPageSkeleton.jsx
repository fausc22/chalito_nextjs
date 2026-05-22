import { Card, CardContent } from '@/components/ui/card';

export function GastosPageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-auto">
                    <div className="h-8 w-64 bg-accent rounded mb-2"></div>
                    <div className="h-4 w-48 bg-accent rounded"></div>
                </div>
                <div className="h-10 w-40 bg-accent rounded"></div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-accent rounded-lg"></div>
                                <div>
                                    <div className="h-4 w-24 bg-accent rounded mb-2"></div>
                                    <div className="h-6 w-32 bg-accent rounded"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters skeleton */}
            <div className="bg-card rounded-xl p-6 border border-border">
                <div className="h-5 w-20 bg-accent rounded mb-4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i}>
                            <div className="h-4 w-16 bg-accent rounded mb-2"></div>
                            <div className="h-10 w-full bg-accent rounded"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Table skeleton */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 bg-muted">
                    <div className="flex gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-4 w-24 bg-accent rounded"></div>
                        ))}
                    </div>
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 border-t">
                        <div className="flex gap-4">
                            {[1, 2, 3, 4, 5, 6].map((j) => (
                                <div key={j} className="h-4 w-24 bg-accent rounded"></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

