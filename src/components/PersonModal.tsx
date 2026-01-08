'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Person } from '@prisma/client';
import { X, Edit2, Save, Trash2, Loader2 } from 'lucide-react';
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
}

export default function PersonModal({ person, isOpen, onClose, onUpdate }: PersonModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showPinPrompt, setShowPinPrompt] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [pin, setPin] = useState('');
    const [verifiedPin, setVerifiedPin] = useState('');
    const [formData, setFormData] = useState<Partial<Person>>(person);
    const [isSaving, setIsSaving] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Photo upload states
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(person.photo);
    const [newPhotoUrl, setNewPhotoUrl] = useState<string | null>(null);
    const [oldPhotoUrl, setOldPhotoUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Hobbies state
    const [hobbies, setHobbies] = useState<string[]>(person.hobbies || []);
    const [currentHobby, setCurrentHobby] = useState('');

    const cancelEdit = async () => {
        // Clean up newly uploaded photo if not saved
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

                // Delete old photo if a new one was uploaded
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
                toast.success('Profile updated successfully', { id: saveToast });

                // Trigger refresh with updated data
                onUpdate?.(updatedPerson);
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to save', { id: saveToast });
            }
        } catch {
            toast.error('Error saving changes', { id: saveToast });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const deleteToast = toast.loading('Deleting profile...');

        try {
            const response = await fetch(`/api/people/${person.id}?pin=${verifiedPin}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Delete photo from storage
                if (person.photo) {
                    try {
                        await fetch('/api/upload-photo', {
                            method: 'DELETE',
                            body: JSON.stringify({ url: person.photo }),
                        });
                    } catch {
                        console.error('Failed to delete photo');
                    }
                }

                toast.success('Profile deleted successfully', { id: deleteToast });
                onClose();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to delete', { id: deleteToast });
            }
        } catch {
            toast.error('Error deleting person', { id: deleteToast });
        } finally {
            setIsDeleting(false);
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
                <DialogContent className="max-h-[90vh] max-w-[90vw] overflow-y-auto overflow-x-hidden p-0">
                    {/* Hidden title for accessibility */}
                    <VisuallyHidden>
                        <DialogTitle>
                            {isEditing ? 'Edit Profile' : `${person.firstName} ${person.lastName}`}
                        </DialogTitle>
                    </VisuallyHidden>

                    {/* Sticky Header */}
                    <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center z-10">
                        <h2 className="text-2xl font-bold text-slate-800">
                            {isEditing ? 'Edit Profile' : `${person.firstName} ${person.lastName}`}
                        </h2>
                        <div className="flex items-center gap-2">
                            {!isEditing && (
                                <button
                                    onClick={() => setShowPinPrompt(true)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                    title="Edit profile"
                                >
                                    <Edit2 size={24} className="text-slate-600" />
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
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
                            <ViewMode person={person} />
                        )}
                    </div>

                    {/* Action Buttons (Edit Mode) */}
                    {isEditing && (
                        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex justify-between">
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={18} />
                                        Delete
                                    </>
                                )}
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={cancelEdit}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || uploadingPhoto}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Save
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* PIN Prompt Overlay - Outside Dialog to fix z-index */}
            {showPinPrompt && (
                <Dialog open={showPinPrompt} onOpenChange={setShowPinPrompt}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Enter PIN to Edit</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !isVerifying && handleUnlock()}
                                placeholder="Enter your PIN"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                disabled={isVerifying}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowPinPrompt(false);
                                        setPin('');
                                    }}
                                    disabled={isVerifying}
                                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUnlock}
                                    disabled={isVerifying}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Unlock'
                                    )}
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation - Using Dialog */}
            {showDeleteConfirm && (
                <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="text-red-700">Confirm Delete</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-slate-700">
                                Are you sure you want to delete this profile? This action cannot be undone.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

function ViewMode({ person }: { person: Person }) {
    return (
        <div className="space-y-6">
            {person.photo && (
                <div className="relative w-full aspect-square max-w-md mx-auto rounded-xl overflow-hidden">
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

            <Section title="Basic Information">
                <Detail label="Full Name" value={`${person.firstName} ${person.lastName}`} />
                <Detail label="Phone Number" value={person.phoneNumber} />
                <Detail label="Recruit Number" value={person.recruitNumber} />
                {person.email && <Detail label="Email" value={person.email} />}
                {person.age && <Detail label="Age" value={person.age} />}
                {person.placeOfBirth && <Detail label="Place of Birth" value={person.placeOfBirth} />}
            </Section>

            <Section title="Biography">
                <p className="text-slate-800 whitespace-pre-wrap">{person.biography}</p>
            </Section>

            <Section title="Previous Work Experience">
                <p className="text-slate-800 whitespace-pre-wrap">{person.previousWorkExperience}</p>
            </Section>

            <Section title="Fun Fact">
                <p className="text-slate-800 whitespace-pre-wrap">{person.funFact}</p>
            </Section>

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

            {person.hiddenTalent && (
                <Section title="Hidden Talent">
                    <p className="text-slate-800 whitespace-pre-wrap">{person.hiddenTalent}</p>
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
        <div className="space-y-6">
            {/* Photo Upload */}
            <Section title="Photo">
                <div className="flex flex-col items-center gap-4">
                    {photoPreview && (
                        <div className="relative w-48 h-48 rounded-lg overflow-hidden">
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            </Section>

            <Section title="Basic Information">
                <Input label="First Name*" value={formData.firstName} onChange={(v) => updateField('firstName', v)} required />
                <Input label="Last Name*" value={formData.lastName} onChange={(v) => updateField('lastName', v)} required />
                <Input label="Phone Number*" value={formData.phoneNumber} onChange={(v) => updateField('phoneNumber', v)} required />
                <Input label="Recruit Number*" value={formData.recruitNumber} onChange={(v) => updateField('recruitNumber', v)} required />
                <Input label="Email" value={formData.email} onChange={(v) => updateField('email', v)} />
                <Input label="Age" value={formData.age} onChange={(v) => updateField('age', v ? parseInt(v) : null)} type="number" />
                <Input label="Place of Birth" value={formData.placeOfBirth} onChange={(v) => updateField('placeOfBirth', v)} />
            </Section>

            <Section title="Biography*">
                <textarea
                    value={formData.biography || ''}
                    onChange={(e) => updateField('biography', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    required
                />
            </Section>

            <Section title="Previous Work Experience*">
                <textarea
                    value={formData.previousWorkExperience || ''}
                    onChange={(e) => updateField('previousWorkExperience', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    required
                />
            </Section>

            <Section title="Fun Fact*">
                <textarea
                    value={formData.funFact || ''}
                    onChange={(e) => updateField('funFact', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </Section>

            <Section title="Social Media">
                <Input label="Instagram" value={formData.instagram} onChange={(v) => updateField('instagram', v)} />
                <Input label="Facebook" value={formData.facebook} onChange={(v) => updateField('facebook', v)} />
                <Input label="TikTok" value={formData.tikTok} onChange={(v) => updateField('tikTok', v)} />
            </Section>

            <Section title="Hobbies">
                <div className="flex gap-2">
                    <input
                        value={currentHobby}
                        onChange={(e) => setCurrentHobby(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                        placeholder="Add a hobby"
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="button"
                        onClick={addHobby}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg"
                    >
                        Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                    {hobbies.map(hobby => (
                        <span key={hobby} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                            {hobby}
                            <button type="button" onClick={() => removeHobby(hobby)} className="text-blue-700 hover:text-blue-900 font-semibold">×</button>
                        </span>
                    ))}
                </div>
            </Section>

            <Section title="Favorites">
                <Input label="Movie" value={formData.favoriteMovie} onChange={(v) => updateField('favoriteMovie', v)} />
                <Input label="Food" value={formData.favoriteFood} onChange={(v) => updateField('favoriteFood', v)} />
                <Input label="Travel Destination" value={formData.favoriteTravelDestination} onChange={(v) => updateField('favoriteTravelDestination', v)} />
                <Input label="Music" value={formData.favoriteMusicGenreArtist} onChange={(v) => updateField('favoriteMusicGenreArtist', v)} />
                <Input label="Best Concert" value={formData.bestConcertEvent} onChange={(v) => updateField('bestConcertEvent', v)} />
                <Input label="Karaoke Song" value={formData.karaokeSong} onChange={(v) => updateField('karaokeSong', v)} />
                <Input label="Weekend Activity" value={formData.weekendActivity} onChange={(v) => updateField('weekendActivity', v)} />
                <Input label="Animal" value={formData.favoriteAnimal} onChange={(v) => updateField('favoriteAnimal', v)} />
            </Section>

            <Section title="Other">
                <Input label="Hidden Talent" value={formData.hiddenTalent} onChange={(v) => updateField('hiddenTalent', v)} />
            </Section>
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

function Detail({ label, value }: { label: string; value: string | number | null }) {
    return (
        <div className="flex flex-col sm:flex-row sm:gap-2">
            <span className="text-slate-600 font-medium min-w-[140px]">{label}:</span>
            <span className="text-slate-800">{value}</span>
        </div>
    );
}

function Input({ label, value, onChange, type = 'text', required = false }: {
    label: string;
    value: string | number | null | undefined;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
                {label}
            </label>
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}