import { prisma } from '@/lib/prisma';
import PersonGrid from '@/components/PersonGrid';

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
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-12">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">
                        Firefighter Academy
                    </h1>
                    <p className="text-slate-600">Class Directory</p>
                </header>

                <PersonGrid people={people} />
            </div>
        </main>
    );
}