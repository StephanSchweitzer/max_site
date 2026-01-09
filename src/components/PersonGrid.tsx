'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Person } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import PersonModal from './PersonModal';

interface PersonGridProps {
    people: Person[];
}

export default function PersonGrid({ people: initialPeople }: PersonGridProps) {
    const [people, setPeople] = useState<Person[]>(initialPeople);
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [refreshingId, setRefreshingId] = useState<number | null>(null);

    const handlePersonUpdate = async (updatedPerson: Person) => {
        setRefreshingId(updatedPerson.id);

        // Brief delay for loading animation UX
        await new Promise(resolve => setTimeout(resolve, 300));

        // Update the specific person in the grid
        setPeople(prev =>
            prev.map(p => p.id === updatedPerson.id ? updatedPerson : p)
        );

        setRefreshingId(null);
        setSelectedPerson(null);
    };

    const handleModalClose = () => {
        // Modal handles deletion internally, just close
        setSelectedPerson(null);
    };

    const handlePersonDelete = (deletedPersonId: number) => {
        // Remove the person from the grid
        setPeople(prev => prev.filter(p => p.id !== deletedPersonId));
        setSelectedPerson(null);
    };

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {people.map((person, index) => (
                    <button
                        key={person.id}
                        onClick={() => setSelectedPerson(person)}
                        className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {/* Loading Overlay */}
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