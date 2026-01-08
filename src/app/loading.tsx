import PersonGridSkeleton from '@/components/PersonGridSkeleton';

export default function Loading() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Sidebar button skeleton */}
            <div className="fixed top-6 left-6 z-40 p-2 rounded-md">
                <div className="w-6 h-6 bg-slate-200 animate-pulse rounded" />
            </div>

            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-6">
                    <div className="h-9 w-48 bg-slate-200 animate-pulse rounded-lg mx-auto" />
                </div>
            </header>

            <div className="container mx-auto px-4 py-12">
                <PersonGridSkeleton />
            </div>
        </main>
    );
}