'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface PersonFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PersonFormDialog({ isOpen, onClose }: PersonFormDialogProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [hobbies, setHobbies] = useState<string[]>([]);
    const [currentHobby, setCurrentHobby] = useState('');

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addHobby = () => {
        if (currentHobby.trim() && !hobbies.includes(currentHobby.trim())) {
            setHobbies([...hobbies, currentHobby.trim()]);
            setCurrentHobby('');
        }
    };

    const removeHobby = (hobby: string) => {
        setHobbies(hobbies.filter(h => h !== hobby));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data: any = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phoneNumber: formData.get('phoneNumber'),
            age: formData.get('age') ? parseInt(formData.get('age') as string) : null,
            placeOfBirth: formData.get('placeOfBirth'),
            recruitNumber: formData.get('recruitNumber'),
            photo: photoPreview,
            instagram: formData.get('instagram'),
            facebook: formData.get('facebook'),
            tikTok: formData.get('tikTok'),
            hobbies: hobbies,
            favoriteMovie: formData.get('favoriteMovie'),
            favoriteTravelDestination: formData.get('favoriteTravelDestination'),
            favoriteFood: formData.get('favoriteFood'),
            favoriteMusicGenreArtist: formData.get('favoriteMusicGenreArtist'),
            bestConcertEvent: formData.get('bestConcertEvent'),
            karaokeSong: formData.get('karaokeSong'),
            weekendActivity: formData.get('weekendActivity'),
            favoriteAnimal: formData.get('favoriteAnimal'),
            funFact: formData.get('funFact'),
            hiddenTalent: formData.get('hiddenTalent'),
            previousWorkExperience: formData.get('previousWorkExperience'),
            biography: formData.get('biography'),
            secretPin: formData.get('secretPin'),
        };

        try {
            const response = await fetch('/api/people', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add person');
            }

            router.refresh();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50" onClick={onClose} />

                <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                        <h2 className="text-2xl font-bold text-slate-800">Add Yourself</h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-3 space-y-3">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Required Information */}
                        <div className="space-y-6 bg-slate-200 p-5 rounded-lg border border-slate-500">
                            <h3 className="font-semibold text-slate-800 mb-3 text-lg">Required Information *</h3>
                            <label className="block text-sm font-semibold text-slate-700">
                                Identification
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input name="recruitNumber" placeholder="Recruit Number *" required className="input"/>
                                <input name="firstName" placeholder="First Name *" required className="input" />
                                <input name="lastName" placeholder="Last Name *" required className="input" />
                                <input name="phoneNumber" type="tel" placeholder="Phone Number *" required className="input" />
                            </div>

                            {/* Photo Upload */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-700">
                                    Photo
                                </label>

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-start gap-4 cursor-pointer"
                                >
                                    {photoPreview ? (
                                        <div className="relative group">
                                            <Image
                                                src={photoPreview}
                                                alt="Preview"
                                                width={112}
                                                height={112}
                                                className="rounded-2xl object-cover border-2 border-blue-200 shadow-sm"
                                                unoptimized={true}
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPhotoPreview(null);
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 flex items-center justify-center">
                                            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <div className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-center">
                                            {photoPreview ? 'Change' : 'Upload'}
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">PNG, JPG up to 10MB</p>
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        required
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-slate-700">
                                    About you
                                </label>
                                <textarea
                                    name="previousWorkExperience"
                                    placeholder="Previous Work Experience *"
                                    rows={4}
                                    required
                                    className="input resize-none w-full"
                                />
                                <textarea
                                    name="biography"
                                    placeholder="Biography *"
                                    rows={5}
                                    required
                                    className="input resize-none w-full"
                                />
                                <textarea
                                    name="funFact"
                                    placeholder="Fun Fact *"
                                    rows={3}
                                    required
                                    className="input resize-none w-full"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-slate-700">
                                    Secret Pin
                                </label>
                                <input
                                    name="secretPin"
                                    placeholder="Pin"
                                    required
                                    className="input w-full "
                                />
                                <p className="text-xs text-slate-600">Remember this PIN - you&apos;ll need it to edit or delete this entry</p></div>
                        </div>

                        {/* Optional Information */}
                        <div className="space-y-6 bg-slate-200 p-5 rounded-lg border border-slate-500">
                            <h3 className="font-semibold text-slate-800 mb-3 text-lg">Optional Information</h3>

                            {/* Basic Optional Fields */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-slate-700 text-sm">Basic Details</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input name="email" type="email" placeholder="Email" className="input" />
                                    <input name="age" type="number" placeholder="Age" className="input" />
                                    <input name="placeOfBirth" placeholder="Place of Birth" className="input sm:col-span-2" />
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-slate-700 text-sm">Social Media</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <input name="instagram" placeholder="Instagram" className="input" />
                                    <input name="facebook" placeholder="Facebook" className="input" />
                                    <input name="tikTok" placeholder="TikTok" className="input" />
                                </div>
                            </div>

                            {/* Hobbies */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-slate-700 text-sm">Hobbies</h4>
                                <div className="flex gap-2">
                                    <input
                                        value={currentHobby}
                                        onChange={(e) => setCurrentHobby(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                                        placeholder="Add a hobby"
                                        className="input flex-1"
                                    />
                                    <button type="button" onClick={addHobby} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 rounded-lg">
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {hobbies.map(hobby => (
                                        <span key={hobby} className="bg-blue-200 text-blue-900 px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                                            {hobby}
                                            <button type="button" onClick={() => removeHobby(hobby)} className="text-blue-700 hover:text-blue-900 font-semibold">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Favorites & Interests */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-slate-700 text-sm">Favorites & Interests</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input name="favoriteMovie" placeholder="Favorite Movie" className="input" />
                                    <input name="favoriteTravelDestination" placeholder="Favorite Travel Destination" className="input" />
                                    <input name="favoriteFood" placeholder="Favorite Food" className="input" />
                                    <input name="favoriteMusicGenreArtist" placeholder="Favorite Music Genre/Artist" className="input" />
                                    <input name="bestConcertEvent" placeholder="Best Concert/Event" className="input" />
                                    <input name="karaokeSong" placeholder="Go-to Karaoke Song" className="input" />
                                    <input name="weekendActivity" placeholder="Favorite Weekend Activity" className="input" />
                                    <input name="favoriteAnimal" placeholder="Favorite Animal" className="input" />
                                </div>
                            </div>

                            {/* Personal Traits */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-slate-700 text-sm">Personal Traits</h4>
                                <textarea name="hiddenTalent" placeholder="Hidden Talent" rows={3} className="input resize-none w-full" />
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-6 border-t border-slate-200 justify-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? 'Adding...' : 'Add Yourself'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx>{`
                .input {
                    @apply w-full px-6 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-slate-800;
                }
                .btn-primary {
                    @apply px-6 py-3 bg-green-400 text-white font-medium rounded-2xl hover:bg-green-500 active:bg-green-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow;
                }
                .btn-secondary {
                    @apply px-6 py-3 bg-slate-400 text-white font-medium rounded-2xl hover:bg-slate-500 active:bg-slate-600 transition-all;
                }
            `}</style>
        </div>
    );
}