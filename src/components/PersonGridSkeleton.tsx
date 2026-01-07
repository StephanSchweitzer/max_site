export default function PersonGridSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="aspect-square bg-slate-200 animate-pulse" />
                    <div className="p-4 space-y-2">
                        <div className="h-4 bg-slate-200 animate-pulse rounded w-3/4" />
                        <div className="h-4 bg-slate-200 animate-pulse rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}