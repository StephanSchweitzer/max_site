'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface PersonFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PersonFormDialog({ isOpen, onClose }: PersonFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [deletingPhoto, setDeletingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [hobbies, setHobbies] = useState<string[]>([]);
    const [currentHobby, setCurrentHobby] = useState('');

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Set preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Vercel Blob
        setUploadingPhoto(true);
        const uploadToast = toast.loading('Uploading photo...');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload-photo', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload photo');
            }

            const { url } = await response.json();
            setPhotoUrl(url);
            setSelectedFile(file);
            toast.success('Photo uploaded successfully!', { id: uploadToast });
        } catch (err) {
            toast.error('Failed to upload photo. Please try again.', { id: uploadToast });
            setPhotoPreview(null);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const resetForm = () => {
        setPhotoPreview(null);
        setPhotoUrl(null);
        setSelectedFile(null);
        setHobbies([]);
        setCurrentHobby('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = async () => {
        if (photoUrl && !loading) {
            setDeletingPhoto(true);
            try {
                await fetch('/api/upload-photo', {
                    method: 'DELETE',
                    body: JSON.stringify({ url: photoUrl }),
                });
            } catch (err) {
                console.error('Failed to delete orphaned photo:', err);
            } finally {
                setDeletingPhoto(false);
            }
        }
        resetForm();
        onClose();
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

        if (!photoUrl) {
            toast.error('Please upload a photo');
            return;
        }

        setLoading(true);
        const submitToast = toast.loading('Adding your profile...');

        const formData = new FormData(e.currentTarget);
        const data: any = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phoneNumber: formData.get('phoneNumber'),
            age: formData.get('age') ? parseInt(formData.get('age') as string) : null,
            placeOfBirth: formData.get('placeOfBirth'),
            recruitNumber: formData.get('recruitNumber'),
            photo: photoUrl,
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

            toast.success('Profile added successfully!', { id: submitToast });
            resetForm();
            onClose();
            // Reload page to show new person
            setTimeout(() => {
                window.location.reload();
            }, 100);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Something went wrong', { id: submitToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent
                className="max-w-[90vw] overflow-y-auto rounded"
                style={{
                    maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 4rem)',
                }}
            >
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-800">Add Yourself</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3 w-full max-w-full overflow-x-hidden">
                    {/* Required Information */}
                    <div className="space-y-6 bg-slate-200 p-3 sm:p-5 rounded-lg border border-slate-500">
                        <h3 className="font-semibold text-slate-800 mb-3 text-lg">Required Information</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                name="firstName"
                                placeholder="First Name *"
                                required
                                className="input"
                            />
                            <input
                                name="lastName"
                                placeholder="Last Name *"
                                required
                                className="input"
                            />
                            <input
                                name="phoneNumber"
                                placeholder="Phone Number *"
                                required
                                className="input sm:col-span-2"
                            />
                            <input
                                name="recruitNumber"
                                placeholder="Recruit Number *"
                                required
                                className="input sm:col-span-2"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-slate-700">
                                Photo *
                            </label>
                            <div className="flex flex-col items-center gap-4">
                                {photoPreview ? (
                                    <div
                                        onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                                        className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-slate-300 cursor-pointer hover:border-amber-400 transition-colors"
                                    >
                                        <Image
                                            src={photoPreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                        {uploadingPhoto && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                                        className="w-48 h-48 rounded-full bg-slate-100 border-4 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-slate-200 transition-colors"
                                    >
                                        {uploadingPhoto ? (
                                            <Loader2 className="w-16 h-16 text-slate-400 animate-spin" />
                                        ) : (
                                            <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        )}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    disabled={uploadingPhoto}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {uploadingPhoto && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {uploadingPhoto ? 'Uploading...' : photoPreview ? 'Change Photo' : 'Upload Photo *'}
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
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
                                className="input w-full"
                            />
                            <p className="text-xs text-slate-600">Remember this PIN - you&apos;ll need it to edit or delete this post.</p>
                            <p className="text-xs text-slate-600">DO NOT use actual sensitive data, your entry is not encrypted.</p>
                        </div>
                    </div>

                    {/* Optional Information */}
                    <div className="space-y-6 bg-slate-200 p-3 sm:p-5 rounded-lg border border-slate-500">
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
                                <button type="button" onClick={addHobby} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 sm:px-8 rounded-lg">
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
                            disabled={loading || uploadingPhoto || !photoUrl}
                            className="btn-primary flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'Adding...' : 'Add Yourself'}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading || deletingPhoto}
                            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {deletingPhoto && <Loader2 className="w-4 h-4 animate-spin" />}
                            Cancel
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}