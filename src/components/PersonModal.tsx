'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Person } from '@prisma/client';
import { X } from 'lucide-react';

interface PersonModalProps {
    person: Person;
    onClose: () => void;
}

export default function PersonModal({ person, onClose }: PersonModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {person.firstName} {person.lastName}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {person.photo && (
                        <div className="relative w-full aspect-square max-w-md mx-auto mb-6 rounded-xl overflow-hidden">
                            <Image
                                src={person.photo}
                                alt={`${person.firstName} ${person.lastName}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />
                        </div>
                    )}

                    <div className="space-y-6">
                        {person.email && (
                            <Section title="Contact">
                                {person.email && <Detail label="Email" value={person.email} />}
                                {person.phoneNumber && <Detail label="Phone" value={person.phoneNumber} />}
                            </Section>
                        )}

                        {(person.age || person.placeOfBirth) && (
                            <Section title="Basic Info">
                                {person.age && <Detail label="Age" value={person.age} />}
                                {person.placeOfBirth && <Detail label="Place of Birth" value={person.placeOfBirth} />}
                            </Section>
                        )}

                        {(person.instagram || person.facebook || person.tikTok) && (
                            <Section title="Social Media">
                                {person.instagram && <Detail label="Instagram" value={person.instagram} />}
                                {person.facebook && <Detail label="Facebook" value={person.facebook} />}
                                {person.tikTok && <Detail label="TikTok" value={person.tikTok} />}
                            </Section>
                        )}

                        {person.hobbies?.length > 0 && (
                            <Section title="Hobbies">
                                <div className="flex flex-wrap gap-2">
                                    {person.hobbies.map((hobby, i) => (
                                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {hobby}
                    </span>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {(person.favoriteMovie || person.favoriteFood || person.favoriteTravelDestination ||
                            person.favoriteMusicGenreArtist || person.bestConcertEvent || person.karaokeSong ||
                            person.weekendActivity || person.favoriteAnimal) && (
                            <Section title="Favorites">
                                {person.favoriteMovie && <Detail label="Movie" value={person.favoriteMovie} />}
                                {person.favoriteFood && <Detail label="Food" value={person.favoriteFood} />}
                                {person.favoriteTravelDestination && <Detail label="Travel Destination" value={person.favoriteTravelDestination} />}
                                {person.favoriteMusicGenreArtist && <Detail label="Music" value={person.favoriteMusicGenreArtist} />}
                                {person.bestConcertEvent && <Detail label="Best Concert" value={person.bestConcertEvent} />}
                                {person.karaokeSong && <Detail label="Karaoke Song" value={person.karaokeSong} />}
                                {person.weekendActivity && <Detail label="Weekend Activity" value={person.weekendActivity} />}
                                {person.favoriteAnimal && <Detail label="Animal" value={person.favoriteAnimal} />}
                            </Section>
                        )}

                        {(person.funFact || person.hiddenTalent) && (
                            <Section title="About Me">
                                {person.funFact && <Detail label="Fun Fact" value={person.funFact} />}
                                {person.hiddenTalent && <Detail label="Hidden Talent" value={person.hiddenTalent} />}
                            </Section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">{title}</h3>
            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
}

function Detail({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="flex flex-col sm:flex-row sm:gap-2">
            <span className="text-slate-600 font-medium min-w-[140px]">{label}:</span>
            <span className="text-slate-800">{value}</span>
        </div>
    );
}