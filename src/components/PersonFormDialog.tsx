'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
                        <h2 className="text-2xl font-bold text-slate-800">Add New Person</h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Photo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Photo
                            </label>
                            <div className="flex items-center space-x-4">
                                {photoPreview && (
                                    <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-800">Basic Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input name="firstName" placeholder="First Name" className="input" />
                                <input name="lastName" placeholder="Last Name" className="input" />
                                <input name="email" type="email" placeholder="Email" className="input" />
                                <input name="phoneNumber" type="tel" placeholder="Phone Number" className="input" />
                                <input name="age" type="number" placeholder="Age" className="input" />
                                <input name="placeOfBirth" placeholder="Place of Birth" className="input" />
                            </div>
                        </div>

                        {/* Secret PIN */}
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-2">Security</h3>
                            <input
                                name="secretPin"
                                type="password"
                                placeholder="Secret PIN (required for editing/deleting)"
                                required
                                className="input"
                            />
                            <p className="text-xs text-slate-500 mt-1">Remember this PIN - you'll need it to edit or delete your profile</p>
                        </div>

                        {/* Social Media */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-800">Social Media</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <input name="instagram" placeholder="Instagram" className="input" />
                                <input name="facebook" placeholder="Facebook" className="input" />
                                <input name="tikTok" placeholder="TikTok" className="input" />
                            </div>
                        </div>

                        {/* Hobbies */}
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-2">Hobbies</h3>
                            <div className="flex gap-2 mb-2">
                                <input
                                    value={currentHobby}
                                    onChange={(e) => setCurrentHobby(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                                    placeholder="Add a hobby"
                                    className="input flex-1"
                                />
                                <button type="button" onClick={addHobby} className="btn-secondary">
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {hobbies.map(hobby => (
                                    <span key={hobby} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                        {hobby}
                                        <button type="button" onClick={() => removeHobby(hobby)} className="text-blue-600 hover:text-blue-800">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Favorites & Interests */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-800">Favorites & Interests</h3>
                            <div className="grid grid-cols-1 gap-4">
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
                            <h3 className="font-semibold text-slate-800">Personal Traits</h3>
                            <textarea name="funFact" placeholder="Fun Fact" rows={2} className="input resize-none" />
                            <textarea name="hiddenTalent" placeholder="Hidden Talent" rows={2} className="input resize-none" />
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex-1"
                            >
                                {loading ? 'Adding...' : 'Add Person'}
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
                    @apply w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none;
                }
                .btn-primary {
                    @apply px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors;
                }
                .btn-secondary {
                    @apply px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors;
                }
            `}</style>
        </div>
    );
}