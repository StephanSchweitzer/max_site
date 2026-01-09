// PersonGrid.tsx
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Person } from '@prisma/client';
import { Loader2, Search, X } from 'lucide-react';
import PersonModal from './PersonModal';

interface PersonGridProps {
    people: Person[];
}

export default function PersonGrid({ people: initialPeople }: PersonGridProps) {
    const [people, setPeople] = useState<Person[]>(initialPeople);
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [refreshingId, setRefreshingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPeople = useMemo(() => {
        if (!searchQuery.trim()) return people;

        const query = searchQuery.toLowerCase();
        return people.filter(person => {
            const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
            const recruitNumber = person.recruitNumber.toLowerCase();
            return fullName.includes(query) || recruitNumber.includes(query);
        });
    }, [people, searchQuery]);

    const handlePersonUpdate = async (updatedPerson: Person) => {
        setRefreshingId(updatedPerson.id);
        await new Promise(resolve => setTimeout(resolve, 300));
        setPeople(prev =>
            prev.map(p => p.id === updatedPerson.id ? updatedPerson : p)
        );
        setRefreshingId(null);
        setSelectedPerson(null);
    };

    const handleModalClose = () => {
        setSelectedPerson(null);
    };

    const handlePersonDelete = (deletedPersonId: number) => {
        setPeople(prev => prev.filter(p => p.id !== deletedPersonId));
        setSelectedPerson(null);
    };

    return (
        <>
            {/* Search Bar */}
            <div className="mb-8">
                <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or recruit number..."
                        className="w-full pl-12 pr-12 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    )}
                </div>

                {/* Results count */}
                {searchQuery && (
                    <p className="text-center mt-3 text-sm text-slate-600">
                        {filteredPeople.length} {filteredPeople.length === 1 ? 'result' : 'results'} found
                    </p>
                )}
            </div>

            {/* Grid */}
            {filteredPeople.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-slate-500 text-lg">No people found matching &quot;{searchQuery}&quot;</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredPeople.map((person, index) => (
                        <button
                            key={person.id}
                            onClick={() => setSelectedPerson(person)}
                            className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {refreshingId === person.id && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                        <span className="text-sm font-medium text-slate-700">Updating...</span>
                                    </div>
                                </div>
                            )}

                            <div className="aspect-square relative bg-slate-200">
                                {person.photo ? (
                                    <Image
                                        src={person.photo}
                                        alt={`${person.firstName} ${person.lastName}`}
                                        fill
                                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        priority={index < 8}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-20 h-20 rounded-full bg-slate-300 flex items-center justify-center">
                                            <span className="text-3xl text-slate-500">
                                                {person.firstName?.[0]}{person.lastName?.[0]}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-slate-800 text-sm md:text-base">
                                    {person.firstName} {person.lastName}
                                </h3>
                                <p className="text-slate-600 text-xs md:text-sm">
                                    {person.recruitNumber}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {selectedPerson && (
                <PersonModal
                    person={selectedPerson}
                    isOpen={!!selectedPerson}
                    onClose={handleModalClose}
                    onUpdate={handlePersonUpdate}
                    onDelete={handlePersonDelete}
                />
            )}
        </>
    );
}