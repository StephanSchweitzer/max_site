// Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import PersonFormDialog from './PersonFormDialog';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const handleAddPersonClick = () => {
        setIsOpen(false);
        setTimeout(() => setShowForm(true), 300);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-6 left-6 z-40 p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all"
                aria-label="Open menu"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Backdrop */}
            <div
                className={clsx(
                    "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50",
                    "transform transition-transform duration-300 ease-out",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="px-6 py-6 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">Menu</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                aria-label="Close menu"
                            >
                                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6">
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/"
                                    className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <svg className="w-5 h-5 text-slate-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span className="font-medium">Directory</span>
                                </Link>
                            </li>

                            <li>
                                <button
                                    onClick={handleAddPersonClick}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 rounded-lg transition-colors group"
                                >
                                    <svg className="w-5 h-5 text-slate-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    <span className="font-medium">Add Myself</span>
                                </button>
                            </li>

                        </ul>
                    </nav>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-200">
                        <div className="text-xs text-slate-500 text-center">
                            Oakland Firefighter Academy 2026
                        </div>
                    </div>
                </div>
            </aside>

            {/* Form Dialog */}
            <PersonFormDialog isOpen={showForm} onClose={() => setShowForm(false)} />
        </>
    );
}