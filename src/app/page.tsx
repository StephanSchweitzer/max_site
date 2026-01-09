import { prisma } from '@/lib/prisma';
import PersonGrid from '@/components/PersonGrid';
import Sidebar from '@/components/Sidebar';

export const dynamic = 'force-dynamic';

async function getPeople() {
    try {
        const people = await prisma.person.findMany({
            orderBy: { lastName: 'asc' },
        });
        return people;
    } catch (error) {
        console.error('Failed to fetch people:', error);
        return [];
    }
}

export default async function Home() {
    const people = await getPeople();

    return (
        <>
            <Sidebar />

            <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
                    <div className="container mx-auto px-4 py-6">
                        <h1 className="text-3xl font-bold text-slate-800 text-center">
                            Class directory
                        </h1>
                    </div>
                </header>

                <div className="container mx-auto px-4 py-12">
                    <PersonGrid people={people} />
                </div>
            </main>
        </>
    );
}