'use client'

import React from 'react';

export default function Page() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 overflow-hidden relative">
            {/* Floating Background Shapes */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-30 animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-10 w-32 h-32 bg-gradient-to-br from-blue-300 to-indigo-300 rounded-full opacity-20 animate-bounce" style={{animationDelay: '2s', animationDuration: '3s'}}></div>
            </div>

            <div className="text-center space-y-12 max-w-2xl z-10 relative">
                {/* Main Header */}
                <div className="space-y-6">
                    <div className="inline-block">
                        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                            maxpruitt.com
                        </h1>
                        <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 animate-pulse"></div>
                    </div>

                    {/* Status with Animation */}
                    <div className="space-y-4">
                        <p className="text-2xl md:text-3xl font-semibold text-gray-700 animate-fade-in">
                            Under Construction
                        </p>
                    </div>
                </div>

                {/* Interactive Progress Section */}
                <div className="space-y-6">
                    <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out animate-pulse w-3/4"></div>
                        </div>
                        <div className="absolute -top-2 right-1/4 transform translate-x-1/2">
                            <div className="w-4 h-4 bg-purple-500 rounded-full animate-ping"></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <span>Progress:</span>
                        <span className="font-semibold text-purple-600">75%</span>
                    </div>
                </div>

                {/* Animated Icons */}
                <div className="flex justify-center space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300 animate-bounce" style={{animationDelay: '0s'}}>
                        <div className="w-8 h-8 bg-white rounded-lg"></div>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300 animate-bounce" style={{animationDelay: '0.2s'}}>
                        <div className="w-8 h-8 bg-white rounded-lg"></div>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300 animate-bounce" style={{animationDelay: '0.4s'}}>
                        <div className="w-8 h-8 bg-white rounded-lg"></div>
                    </div>
                </div>

                {/* Loading Animation */}
                <div className="flex justify-center items-center space-x-2">
                    <div className="flex space-x-1">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"
                                style={{
                                    animationDelay: `${i * 0.2}s`,
                                    animationDuration: '1s'
                                }}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Animated Grid Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="w-full h-full" style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #8b5cf6 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}></div>
            </div>

            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
        </div>
    );
}