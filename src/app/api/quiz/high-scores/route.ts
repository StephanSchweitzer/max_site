import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, score } = body;

        if (!name || typeof score !== 'number') {
            return NextResponse.json(
                { error: 'Name and score are required' },
                { status: 400 }
            );
        }

        const highScore = await prisma.quizHighScore.create({
            data: {
                name,
                score,
            },
        });

        return NextResponse.json({ success: true, highScore });
    } catch (error) {
        console.error('High score submission error:', error);
        return NextResponse.json(
            { error: 'Failed to submit high score' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const highScores = await prisma.quizHighScore.findMany({
            orderBy: { score: 'desc' },
            take: 10,
        });

        return NextResponse.json({ highScores });
    } catch (error) {
        console.error('High score fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch high scores' },
            { status: 500 }
        );
    }
}