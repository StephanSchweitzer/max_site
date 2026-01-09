'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Trophy, Loader2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

interface Person {
    id: number;
    firstName: string;
    lastName: string;
    photo: string | null;
}

interface QuizQuestion {
    id: string;
    field: string;
    questionText: string;
    value: string;
    people: Person[];
    correctAnswerIds: number[];
}

interface QuizAnswer {
    questionId: string;
    questionText: string;
    selectedPersonId: number;
    correctPersonIds: number[];
    isCorrect: boolean;
    people: Person[];
}

export default function QuizGame() {
    const router = useRouter();
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<QuizAnswer[]>([]);
    const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [gameFinished, setGameFinished] = useState(false);
    const [showHighScoreDialog, setShowHighScoreDialog] = useState(false);
    const [highScoreName, setHighScoreName] = useState('');
    const [submittingScore, setSubmittingScore] = useState(false);

    useEffect(() => {
        loadQuiz();
    }, []);

    const loadQuiz = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/quiz/generate');

            if (!response.ok) {
                throw new Error('Failed to load quiz');
            }

            const data = await response.json();
            setQuestions(data.questions);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load quiz');
        } finally {
            setLoading(false);
        }
    };

    const handlePersonClick = (personId: number) => {
        if (showFeedback) return;
        setSelectedPersonId(personId);
    };

    const handleSubmitAnswer = () => {
        if (selectedPersonId === null) return;

        const currentQuestion = questions[currentQuestionIndex];
        const correct = currentQuestion.correctAnswerIds.includes(selectedPersonId);

        setIsCorrect(correct);
        setShowFeedback(true);

        setAnswers([
            ...answers,
            {
                questionId: currentQuestion.id,
                questionText: currentQuestion.questionText,
                selectedPersonId,
                correctPersonIds: currentQuestion.correctAnswerIds,
                isCorrect: correct,
                people: currentQuestion.people,
            },
        ]);

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedPersonId(null);
                setShowFeedback(false);
            } else {
                setGameFinished(true);
            }
        }, 1500);
    };

    const handleSubmitHighScore = async () => {
        if (!highScoreName.trim()) return;

        try {
            setSubmittingScore(true);
            await fetch('/api/quiz/high-scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: highScoreName.trim(),
                    score: score,
                }),
            });
            setShowHighScoreDialog(false);
            setHighScoreName('');
            router.push('/leaderboard');
        } catch (err) {
            console.error('Failed to submit high score:', err);
        } finally {
            setSubmittingScore(false);
        }
    };

    const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setSelectedPersonId(null);
        setShowFeedback(false);
        setGameFinished(false);
        loadQuiz();
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
                            <Button onClick={loadQuiz}>Try Again</Button>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    const score = answers.filter((a) => a.isCorrect).length;
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    if (gameFinished) {
        return (
            <>
                <Sidebar />
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <Card className="shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                                <CardTitle className="text-3xl flex items-center gap-2">
                                    <Trophy className="h-8 w-8 text-yellow-500" />
                                    Quiz Complete!
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="text-center bg-gradient-to-br from-blue-100 to-indigo-100 py-8 rounded-lg">
                                    <p className="text-5xl font-bold text-blue-700">{score}/10</p>
                                    <p className="text-slate-600 mt-2">
                                        You got {score} out of 10 questions correct!
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Your Answers:</h3>
                                    {answers.map((answer, idx) => (
                                        <Card key={answer.questionId} className={`border-2 ${answer.isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                                            <CardContent className="pt-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1">
                                                        {answer.isCorrect ? (
                                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                        ) : (
                                                            <XCircle className="h-5 w-5 text-red-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium mb-2">
                                                            Question {idx + 1}: {answer.questionText}
                                                        </p>
                                                        <div className="text-sm space-y-1">
                                                            <p>
                                                                Your answer:{' '}
                                                                <span className={answer.isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                                  {answer.people.find((p) => p.id === answer.selectedPersonId)?.firstName}{' '}
                                                                    {answer.people.find((p) => p.id === answer.selectedPersonId)?.lastName}
                                </span>
                                                            </p>
                                                            {!answer.isCorrect && (
                                                                <p>
                                                                    Correct answer(s):{' '}
                                                                    <span className="text-green-700 font-medium">
                                    {answer.correctPersonIds
                                        .map((id) => {
                                            const person = answer.people.find((p) => p.id === id);
                                            return `${person?.firstName} ${person?.lastName}`;
                                        })
                                        .join(', ')}
                                  </span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <div className="flex gap-3 justify-center">
                                    <Button onClick={() => setShowHighScoreDialog(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
                                        Submit High Score
                                    </Button>
                                    <Button onClick={restartQuiz} variant="outline" size="lg">
                                        Play Again
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Dialog open={showHighScoreDialog} onOpenChange={setShowHighScoreDialog}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Submit Your High Score</DialogTitle>
                                    <DialogDescription>
                                        Enter your name to save your score of {score}/10
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Your name"
                                        value={highScoreName}
                                        onChange={(e) => setHighScoreName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmitHighScore()}
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowHighScoreDialog(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSubmitHighScore}
                                            disabled={!highScoreName.trim() || submittingScore}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {submittingScore ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
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
                            <div className="flex items-center justify-between">
                                <CardTitle>Who Knows Who?</CardTitle>
                                <Badge variant="secondary" className="text-lg px-4 py-1 bg-blue-100 text-blue-700">
                                    {currentQuestionIndex + 1} / {questions.length}
                                </Badge>
                            </div>
                            <Progress value={progress} className="mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="text-center p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                                <p className="text-2xl font-semibold text-slate-800">{currentQuestion.questionText}</p>
                            </div>

                            {showFeedback && (
                                <div
                                    className={`text-center p-4 rounded-lg ${
                                        isCorrect ? 'bg-green-100 text-green-800 border-2 border-green-300' : 'bg-red-100 text-red-800 border-2 border-red-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        {isCorrect ? (
                                            <>
                                                <CheckCircle2 className="h-6 w-6" />
                                                <span className="text-xl font-semibold">Correct!</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-6 w-6" />
                                                <span className="text-xl font-semibold">Wrong!</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {currentQuestion.people.map((person) => (
                                    <button
                                        key={person.id}
                                        onClick={() => handlePersonClick(person.id)}
                                        disabled={showFeedback}
                                        className={`relative group transition-all ${
                                            showFeedback && currentQuestion.correctAnswerIds.includes(person.id)
                                                ? 'ring-4 ring-green-500 scale-105'
                                                : selectedPersonId === person.id
                                                    ? 'ring-4 ring-blue-500 scale-105'
                                                    : 'hover:scale-105 hover:shadow-lg'
                                        } ${showFeedback ? 'cursor-default' : 'cursor-pointer'} rounded-lg overflow-hidden shadow-md`}
                                    >
                                        <div className="aspect-square relative bg-slate-100">
                                            {person.photo ? (
                                                <Image
                                                    src={person.photo}
                                                    alt={`${person.firstName} ${person.lastName}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-4xl font-bold text-slate-400">
                                                    {person.firstName[0]}
                                                    {person.lastName[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-2 text-center text-sm font-medium">
                                            {person.firstName} {person.lastName}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    onClick={handleSubmitAnswer}
                                    disabled={selectedPersonId === null || showFeedback}
                                    size="lg"
                                    className="w-full max-w-md bg-blue-600 hover:bg-blue-700"
                                >
                                    Submit Answer
                                </Button>
                            </div>

                            <div className="text-center">
                                <div className="inline-block bg-slate-100 px-6 py-2 rounded-full">
                  <span className="text-sm font-medium text-slate-700">
                    Score: <span className="text-blue-600 font-bold">{score}</span> / {currentQuestionIndex + (showFeedback ? 1 : 0)}
                  </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}