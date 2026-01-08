import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { pin } = await request.json();
        const { id } = await params;
        const personId = parseInt(id);

        if (!pin) {
            return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
        }

        const person = await prisma.person.findUnique({
            where: { id: personId },
            select: { secretPin: true }
        });

        if (!person) {
            return NextResponse.json({ error: 'Person not found' }, { status: 404 });
        }

        const isValid = person.secretPin === pin;

        return NextResponse.json({ valid: isValid });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}