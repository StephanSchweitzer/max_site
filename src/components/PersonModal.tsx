'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Person } from '@prisma/client';
import { Edit2, Save, Trash2, Loader2, Instagram, Twitter, Music } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface PersonModalProps {
    person: Person;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: (updatedPerson: Person) => void;
    onDelete?: (personId: number) => void;
}

export default function PersonModal({ person, isOpen, onClose, onUpdate, onDelete }: PersonModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showPinPrompt, setShowPinPrompt] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [pin, setPin] = useState('');
    const [verifiedPin, setVerifiedPin] = useState('');
    const [formData, setFormData] = useState<Partial<Person>>(person);
    const [isSaving, setIsSaving] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(person.photo);
    const [newPhotoUrl, setNewPhotoUrl] = useState<string | null>(null);
    const [oldPhotoUrl, setOldPhotoUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [hobbies, setHobbies] = useState<string[]>(person.hobbies || []);
    const [currentHobby, setCurrentHobby] = useState('');

    const cancelEdit = async () => {
        if (newPhotoUrl && !isSaving) {
            try {
                await fetch('/api/upload-photo', {
                    method: 'DELETE',
                    body: JSON.stringify({ url: newPhotoUrl }),
                });
            } catch {
                console.error('Failed to delete orphaned photo');
            }
        }

        setIsEditing(false);
        setFormData(person);
        setVerifiedPin('');
        setPhotoPreview(person.photo);
        setNewPhotoUrl(null);
        setOldPhotoUrl(null);
        setHobbies(person.hobbies || []);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showPinPrompt) setShowPinPrompt(false);
                else if (showDeleteConfirm) setShowDeleteConfirm(false);
                else if (isEditing) cancelEdit();
            }
        };
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showPinPrompt, showDeleteConfirm, isEditing, cancelEdit]);

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

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
            setNewPhotoUrl(url);
            if (!oldPhotoUrl) {
                setOldPhotoUrl(person.photo);
            }
            toast.success('Photo uploaded successfully!', { id: uploadToast });
        } catch {
            toast.error('Failed to upload photo. Please try again.', { id: uploadToast });
            setPhotoPreview(person.photo);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleUnlock = async () => {
        setIsVerifying(true);
        try {
            const response = await fetch(`/api/people/${person.id}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin })
            });

            const data = await response.json();

            if (data.valid) {
                setVerifiedPin(pin);
                setIsEditing(true);
                setShowPinPrompt(false);
                setPin('');
                toast.success('Unlocked for editing');
            } else {
                toast.error('Invalid PIN');
            }
        } catch {
            toast.error('Error verifying PIN');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const saveToast = toast.loading('Saving changes...');

        try {
            const photoToSave = newPhotoUrl || formData.photo;

            const response = await fetch(`/api/people/${person.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    photo: photoToSave,
                    hobbies: hobbies,
                    pin: verifiedPin
                })
            });

            if (response.ok) {
                const updatedPerson = await response.json();

                if (newPhotoUrl && oldPhotoUrl) {
                    try {
                        await fetch('/api/upload-photo', {
                            method: 'DELETE',
                            body: JSON.stringify({ url: oldPhotoUrl }),
                        });
                    } catch {
                        console.error('Failed to delete old photo');
                    }
                }

                setIsEditing(false);
                setVerifiedPin('');
                setNewPhotoUrl(null);
                setOldPhotoUrl(null);
                onUpdate?.(updatedPerson);
                toast.success('Profile updated successfully!', { id: saveToast });
            } else {
                toast.error('Failed to update profile', { id: saveToast });
            }
        } catch (error) {
            toast.error('Error saving changes', { id: saveToast });
            console.log(error)
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (pinToUse?: string) => {
        setIsDeleting(true);
        const deleteToast = toast.loading('Deleting person...');

        try {
            const pinValue = pinToUse || verifiedPin;
            const response = await fetch(`/api/people/${person.id}?pin=${encodeURIComponent(pinValue)}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                if (person.photo) {
                    try {
                        await fetch('/api/upload-photo', {
                            method: 'DELETE',
                            body: JSON.stringify({ url: person.photo }),
                        });
                    } catch {
                        console.error('Failed to delete person photo');
                    }
                }

                toast.success('Person deleted successfully', { id: deleteToast });
                onDelete?.(person.id);
                onClose();
            } else {
                toast.error('Failed to delete person', { id: deleteToast });
            }
        } catch {
            toast.error('Error deleting person', { id: deleteToast });
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const updateField = (field: keyof Person, value: string | number | null | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent
                    className="max-w-[90vw] overflow-y-auto bg-white overflow-x-hidden rounded"
                    style={{
                        maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 4rem)',
                    }}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <VisuallyHidden>
                        <DialogTitle>Person Details</DialogTitle>
                    </VisuallyHidden>
                    <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-3">
                            {person.photo && (
                                <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-indigo-200">
                                    <Image
                                        src={person.photo}
                                        alt={`${person.firstName} ${person.lastName}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {person.firstName} {person.lastName}
                                </h2>
                                <p className="text-sm text-slate-600">{person.recruitNumber}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {!isEditing ? (
                                <>
                                    <button
                                        onClick={() => setShowPinPrompt(true)}
                                        className="p-2 hover:bg-indigo-100 rounded-lg transition-colors text-indigo-600"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </>
                            ) : null}
                        </div>
                    </DialogHeader>

                    <div className="py-4 w-full max-w-full overflow-x-hidden">
                        {isEditing ? (
                            <EditForm
                                formData={formData}
                                updateField={updateField}
                                photoPreview={photoPreview}
                                uploadingPhoto={uploadingPhoto}
                                handlePhotoChange={handlePhotoChange}
                                fileInputRef={fileInputRef}
                                hobbies={hobbies}
                                currentHobby={currentHobby}
                                setCurrentHobby={setCurrentHobby}
                                addHobby={addHobby}
                                removeHobby={removeHobby}
                            />
                        ) : (
                            <ViewMode person={person} hobbies={hobbies} />
                        )}

                        {isEditing && (
                            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-2xl hover:bg-blue-700 active:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    className="flex-1 px-6 py-3 bg-slate-400 text-white font-medium rounded-2xl hover:bg-slate-500 active:bg-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {showPinPrompt && (
                <Dialog open={showPinPrompt} onOpenChange={setShowPinPrompt}>
                    <DialogContent
                        className="sm:max-w-md bg-white my-4 sm:my-8"
                        style={{
                            maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 6rem)',
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle>Enter PIN to Edit</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && pin.trim() && handleUnlock()}
                                placeholder="Enter your PIN"
                                className="w-full max-w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-xl"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={handleUnlock}
                                    disabled={isVerifying || !pin.trim()}
                                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-medium transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    {isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isVerifying ? 'Verifying...' : 'Unlock'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPinPrompt(false);
                                        setPin('');
                                    }}
                                    className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {showDeleteConfirm && (
                <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <DialogContent
                        className="sm:max-w-md bg-white my-4 sm:my-8"
                        style={{
                            maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 4rem)',
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-slate-600">
                                Are you sure you want to delete <span className="font-semibold text-slate-900">{person.firstName} {person.lastName}</span>? This action cannot be undone.
                            </p>
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="Enter your PIN"
                                className="w-full max-w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-lg"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={async () => {
                                        if (!pin.trim()) return;
                                        setIsVerifying(true);
                                        try {
                                            const response = await fetch(`/api/people/${person.id}/verify`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ pin })
                                            });
                                            const data = await response.json();
                                            if (data.valid) {
                                                setVerifiedPin(pin);
                                                handleDelete(pin);
                                            } else {
                                                toast.error('Invalid PIN');
                                            }
                                        } catch {
                                            toast.error('Error verifying PIN');
                                        } finally {
                                            setIsVerifying(false);
                                        }
                                    }}
                                    disabled={isVerifying || isDeleting || !pin.trim()}
                                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 disabled:opacity-50 font-medium transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    {(isVerifying || isDeleting) && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isVerifying ? 'Verifying...' : isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setPin('');
                                    }}
                                    className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

function ViewMode({ person, hobbies }: { person: Person; hobbies: string[] }) {
    return (
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
            {/* Photo and Basic Info + Biography - side by side on large screens */}
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
                {/* Left column: Photo + Social Media Icons */}
                {person.photo && (
                    <div className="flex flex-col items-center gap-4 flex-shrink-0">
                        <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] rounded-2xl overflow-hidden shadow-xl ring-4 ring-indigo-100">
                            <Image
                                src={person.photo}
                                alt={`${person.firstName} ${person.lastName}`}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Social Media Icons */}
                        {(person.instagram || person.twitter || person.tikTok) && (
                            <div className="flex gap-3 justify-center items-center">
                                {person.instagram && (
                                    <a
                                        href={person.instagram.startsWith('http') ? person.instagram : `https://instagram.com/${person.instagram.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                                        title="Instagram"
                                    >
                                        <Instagram className="w-6 h-6" />
                                    </a>
                                )}
                                {person.twitter && (
                                    <a
                                        href={person.twitter.startsWith('http') ? person.twitter : `https://twitter.com/${person.twitter.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                                        title="Twitter"
                                    >
                                        <Twitter className="w-6 h-6" />
                                    </a>
                                )}
                                {person.tikTok && (
                                    <a
                                        href={person.tikTok.startsWith('http') ? person.tikTok : `https://tiktok.com/@${person.tikTok.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                                        title="TikTok"
                                    >
                                        <Music className="w-6 h-6" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Right column: Basic Information + Biography */}
                <div className="flex-1 space-y-6">
                    <Section title="Basic Information" color="blue">
                        <Detail label="Phone" value={person.phoneNumber} />
                        {person.email && <Detail label="Email" value={person.email} />}
                        {person.age && <Detail label="Age" value={person.age} />}
                        {person.placeOfBirth && <Detail label="Place of Birth" value={person.placeOfBirth} />}
                    </Section>

                    {person.biography && (
                        <Section title="Biography" color="indigo">
                            <p className="text-slate-800 leading-relaxed break-words">{person.biography}</p>
                        </Section>
                    )}
                </div>
            </div>

            {person.previousWorkExperience && (
                <Section title="Previous Work Experience" color="purple">
                    <p className="text-slate-800 leading-relaxed break-words">{person.previousWorkExperience}</p>
                </Section>
            )}

            {person.funFact && (
                <Section title="Fun Fact" color="teal">
                    <p className="text-slate-800 leading-relaxed break-words">{person.funFact}</p>
                </Section>
            )}

            {hobbies.length > 0 && (
                <Section title="Hobbies" color="teal">
                    <div className="flex flex-wrap gap-2">
                        {hobbies.map(hobby => (
                            <span key={hobby} className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm break-words">
                                {hobby}
                            </span>
                        ))}
                    </div>
                </Section>
            )}

            {(person.favoriteMovie || person.favoriteFood || person.favoriteTravelDestination ||
                person.favoriteMusicGenreArtist || person.bestConcertEvent || person.karaokeSong ||
                person.weekendActivity || person.favoriteAnimal) && (
                <Section title="Favorites" color="indigo">
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

            {person.hiddenTalent && (
                <Section title="Other" color="purple">
                    <Detail label="Hidden Talent" value={person.hiddenTalent} />
                </Section>
            )}
        </div>
    );
}

function EditForm({
                      formData,
                      updateField,
                      photoPreview,
                      uploadingPhoto,
                      handlePhotoChange,
                      fileInputRef,
                      hobbies,
                      currentHobby,
                      setCurrentHobby,
                      addHobby,
                      removeHobby
                  }: {
    formData: Partial<Person>;
    updateField: (field: keyof Person, value: string | number | null | string[]) => void;
    photoPreview: string | null;
    uploadingPhoto: boolean;
    handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    hobbies: string[];
    currentHobby: string;
    setCurrentHobby: (value: string) => void;
    addHobby: () => void;
    removeHobby: (hobby: string) => void;
}) {
    return (
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
            <div className="flex flex-col items-center gap-4 mb-6">
                {photoPreview && (
                    <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[28rem] xl:h-[28rem] rounded-2xl overflow-hidden shadow-lg ring-4 ring-indigo-200">
                        <Image
                            src={photoPreview}
                            alt="Profile preview"
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
                <button
                    type="button"
                    disabled={uploadingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-2xl hover:bg-blue-700 active:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
                >
                    {uploadingPhoto && <Loader2 className="w-4 h-4 animate-spin" />}
                    {uploadingPhoto ? 'Uploading...' : photoPreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                />
            </div>

            <Section title="Basic Information" color="blue" editMode>
                <Input label="First Name*" value={formData.firstName} onChange={(v) => updateField('firstName', v)} required color="blue" />
                <Input label="Last Name*" value={formData.lastName} onChange={(v) => updateField('lastName', v)} required color="blue" />
                <Input label="Phone Number*" value={formData.phoneNumber} onChange={(v) => updateField('phoneNumber', v)} required color="blue" />
                <Input label="Recruit Number*" value={formData.recruitNumber} onChange={(v) => updateField('recruitNumber', v)} required color="blue" />
                <Input label="Email" value={formData.email} onChange={(v) => updateField('email', v)} color="blue" />
                <Input label="Age" value={formData.age} onChange={(v) => updateField('age', v ? parseInt(v) : null)} type="number" color="blue" />
                <Input label="Place of Birth" value={formData.placeOfBirth} onChange={(v) => updateField('placeOfBirth', v)} color="blue" />
            </Section>

            <Section title="Biography*" color="indigo" editMode>
                <textarea
                    value={formData.biography || ''}
                    onChange={(e) => updateField('biography', e.target.value)}
                    className="w-full max-w-full min-w-0 px-4 py-3 border-2 border-indigo-200 bg-indigo-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px] transition-all resize-none"
                    required
                />
            </Section>

            <Section title="Previous Work Experience*" color="purple" editMode>
                <textarea
                    value={formData.previousWorkExperience || ''}
                    onChange={(e) => updateField('previousWorkExperience', e.target.value)}
                    className="w-full max-w-full min-w-0 px-4 py-3 border-2 border-purple-200 bg-purple-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px] transition-all resize-none"
                    required
                />
            </Section>

            <Section title="Fun Fact*" color="teal" editMode>
                <textarea
                    value={formData.funFact || ''}
                    onChange={(e) => updateField('funFact', e.target.value)}
                    className="w-full max-w-full min-w-0 px-4 py-3 border-2 border-teal-200 bg-teal-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[80px] transition-all resize-none"
                    required
                />
            </Section>

            <Section title="Social Media" color="blue" editMode>
                <Input label="Instagram username" value={formData.instagram} onChange={(v) => updateField('instagram', v)} color="blue" />
                <Input label="Twitter username" value={formData.twitter} onChange={(v) => updateField('twitter', v)} color="blue" />
                <Input label="TikTok username" value={formData.tikTok} onChange={(v) => updateField('tikTok', v)} color="blue" />
            </Section>

            <Section title="Hobbies" color="teal" editMode>
                <div className="flex gap-2">
                    <input
                        value={currentHobby}
                        onChange={(e) => setCurrentHobby(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                        placeholder="Add a hobby"
                        className="flex-1 min-w-0 px-4 py-2.5 border-2 border-teal-200 bg-teal-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                    <button
                        type="button"
                        onClick={addHobby}
                        className="flex-shrink-0 px-6 py-3 bg-blue-600 text-white font-medium rounded-2xl hover:bg-blue-700 active:bg-blue-700 transition-all shadow-sm hover:shadow"
                    >
                        Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                    {hobbies.map(hobby => (
                        <span key={hobby} className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm flex items-center gap-2 font-medium shadow-sm ring-1 ring-teal-200 break-words">
                            {hobby}
                            <button type="button" onClick={() => removeHobby(hobby)} className="text-teal-900 hover:text-teal-700 font-bold text-lg leading-none flex-shrink-0">×</button>
                        </span>
                    ))}
                </div>
            </Section>

            <Section title="Favorites" color="indigo" editMode>
                <Input label="Movie" value={formData.favoriteMovie} onChange={(v) => updateField('favoriteMovie', v)} color="indigo" />
                <Input label="Food" value={formData.favoriteFood} onChange={(v) => updateField('favoriteFood', v)} color="indigo" />
                <Input label="Travel Destination" value={formData.favoriteTravelDestination} onChange={(v) => updateField('favoriteTravelDestination', v)} color="indigo" />
                <Input label="Music" value={formData.favoriteMusicGenreArtist} onChange={(v) => updateField('favoriteMusicGenreArtist', v)} color="indigo" />
                <Input label="Best Concert" value={formData.bestConcertEvent} onChange={(v) => updateField('bestConcertEvent', v)} color="indigo" />
                <Input label="Karaoke Song" value={formData.karaokeSong} onChange={(v) => updateField('karaokeSong', v)} color="indigo" />
                <Input label="Weekend Activity" value={formData.weekendActivity} onChange={(v) => updateField('weekendActivity', v)} color="indigo" />
                <Input label="Animal" value={formData.favoriteAnimal} onChange={(v) => updateField('favoriteAnimal', v)} color="indigo" />
            </Section>

            <Section title="Other" color="purple" editMode>
                <Input label="Hidden Talent" value={formData.hiddenTalent} onChange={(v) => updateField('hiddenTalent', v)} color="purple" />
            </Section>
        </div>
    );
}

function Section({ title, children, color = "slate", editMode = false }: {
    title: string;
    children: React.ReactNode;
    color?: "indigo" | "blue" | "purple" | "teal" | "slate";
    editMode?: boolean;
}) {
    const colorClasses = {
        indigo: editMode ? "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200" : "bg-gradient-to-br from-indigo-50/80 to-purple-50/60 border-indigo-100",
        blue: editMode ? "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200" : "bg-gradient-to-br from-blue-50/80 to-cyan-50/60 border-blue-100",
        purple: editMode ? "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200" : "bg-gradient-to-br from-purple-50/80 to-pink-50/60 border-purple-100",
        teal: editMode ? "bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200" : "bg-gradient-to-br from-teal-50/80 to-cyan-50/60 border-teal-100",
        slate: "bg-slate-50 border-slate-200"
    };

    const titleColorClasses = {
        indigo: "text-indigo-700",
        blue: "text-blue-700",
        purple: "text-purple-700",
        teal: "text-teal-700",
        slate: "text-slate-700"
    };

    return (
        <div className={`w-full max-w-full ${colorClasses[color]} border-2 rounded-xl p-5 shadow-sm transition-all ${editMode ? 'shadow-md' : ''}`}>
            <h3 className={`text-lg font-bold ${titleColorClasses[color]} mb-4`}>{title}</h3>
            <div className="space-y-3 w-full max-w-full">
                {children}
            </div>
        </div>
    );
}

function Detail({ label, value }: { label: string; value: string | number | null }) {
    return (
        <div className="flex flex-col sm:flex-row sm:gap-2 py-1 w-full max-w-full">
            <span className="text-slate-600 font-semibold min-w-[140px] flex-shrink-0">{label}:</span>
            <span className="text-slate-900 break-words">{value}</span>
        </div>
    );
}

function Input({ label, value, onChange, type = 'text', required = false, color = "blue" }: {
    label: string;
    value: string | number | null | undefined;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
    color?: string;
}) {
    const colorClasses = {
        blue: "border-blue-200 bg-blue-50/50 focus:ring-blue-500 focus:border-transparent",
        indigo: "border-indigo-200 bg-indigo-50/50 focus:ring-indigo-500 focus:border-transparent",
        purple: "border-purple-200 bg-purple-50/50 focus:ring-purple-500 focus:border-transparent",
        teal: "border-teal-200 bg-teal-50/50 focus:ring-teal-500 focus:border-transparent",
    };

    return (
        <div className="w-full max-w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {label}
            </label>
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className={`w-full max-w-full min-w-0 px-4 py-2.5 border-2 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} rounded-lg focus:outline-none focus:ring-2 transition-all`}
            />
        </div>
    );
}