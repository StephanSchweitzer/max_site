import PersonGridSkeleton from '@/components/PersonGridSkeleton';

export default function Loading() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-12">
                <header className="mb-12 text-center">
                    <div className="h-10 w-64 bg-slate-200 animate-pulse rounded-lg mx-auto mb-2" />
                    <div className="h-6 w-32 bg-slate-200 animate-pulse rounded-lg mx-auto" />
                </header>

                <PersonGridSkeleton />
            </div>
        </main>
    );
}