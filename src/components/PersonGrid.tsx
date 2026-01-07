'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Person } from '@prisma/client';
import PersonModal from './PersonModal';

interface PersonGridProps {
    people: Person[];
}

export default function PersonGrid({ people }: PersonGridProps) {
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {people.map((person, index) => (
                    <button
                        key={person.id}
                        onClick={() => setSelectedPerson(person)}
                        className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
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
                                {person.firstName}
                            </h3>
                            <p className="text-slate-600 text-xs md:text-sm">
                                {person.lastName}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {selectedPerson && (
                <PersonModal
                    person={selectedPerson}
                    onClose={() => setSelectedPerson(null)}
                />
            )}
        </>
    );
}