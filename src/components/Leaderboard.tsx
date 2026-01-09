'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Loader2, ArrowLeft } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

interface HighScore {
    id: number;
    name: string;
    score: number;
    createdAt: string;
}

export default function Leaderboard() {
    const [highScores, setHighScores] = useState<HighScore[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadHighScores();
    }, []);

    const loadHighScores = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/quiz/high-scores');

            if (!response.ok) {
                throw new Error('Failed to load high scores');
            }

            const data = await response.json();
            setHighScores(data.highScores);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load high scores');
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Trophy className="h-6 w-6 text-yellow-500" />;
            case 1:
                return <Medal className="h-6 w-6 text-gray-400" />;
            case 2:
                return <Award className="h-6 w-6 text-amber-600" />;
            default:
                return null;
        }
    };

    const getRankBadgeVariant = (index: number): "default" | "secondary" | "destructive" | "outline" => {
        switch (index) {
            case 0:
                return "default";
            case 1:
                return "secondary";
            case 2:
                return "outline";
            default:
                return "secondary";
        }
    };

    if (loading) {
        return (
            <>
                <Sidebar />
                <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Sidebar />
                <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                    <Card className="w-full max-w-md shadow-lg">
                        <CardHeader>
                            <CardTitle>Error</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-destructive mb-4">{error}</p>
                            <Button onClick={loadHighScores}>Try Again</Button>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <Sidebar />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
                <div className="container mx-auto px-4 max-w-4xl">

                    <Card className="shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                            <CardTitle className="text-3xl flex items-center gap-2">
                                <Trophy className="h-8 w-8 text-yellow-500" />
                                Leaderboard
                            </CardTitle>
                            <p className="text-slate-600">Top 10 Quiz Masters</p>
                        </CardHeader>
                        <CardContent className="pt-6">{/* Rest of content */}
                            {highScores.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-lg">
                                    <p className="text-slate-600 mb-4">No high scores yet!</p>
                                    <Link href="/quiz">
                                        <Button className="bg-blue-600 hover:bg-blue-700">Be the first to play</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {highScores.map((score, index) => (
                                        <div
                                            key={score.id}
                                            className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all shadow-sm ${
                                                index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300' :
                                                    index === 1 ? 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-300' :
                                                        index === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300' :
                                                            'bg-white border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center w-12">
                                                {getRankIcon(index) || (
                                                    <Badge variant={getRankBadgeVariant(index)} className="w-8 h-8 flex items-center justify-center">
                                                        {index + 1}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <p className="font-semibold text-lg text-slate-800">{score.name}</p>
                                                <p className="text-sm text-slate-600">
                                                    {new Date(score.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-blue-600">{score.score}</p>
                                                <p className="text-sm text-slate-600">/ 10</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}