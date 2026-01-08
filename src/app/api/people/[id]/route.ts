import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { pin, ...updateData } = body;
        const { id } = await params;
        const personId = parseInt(id);

        if (!pin) {
            return NextResponse.json({ error: 'PIN is required' }, { status: 401 });
        }

        // Verify PIN
        const person = await prisma.person.findUnique({
            where: { id: personId },
            select: { secretPin: true }
        });

        if (!person) {
            return NextResponse.json({ error: 'Person not found' }, { status: 404 });
        }

        if (person.secretPin !== pin) {
            return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
        }

        // Update person
        const updatedPerson = await prisma.person.update({
            where: { id: personId },
            data: updateData
        });

        return NextResponse.json(updatedPerson);
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { searchParams } = new URL(request.url);
        const pin = searchParams.get('pin');
        const { id } = await params;
        const personId = parseInt(id);

        if (!pin) {
            return NextResponse.json({ error: 'PIN is required' }, { status: 401 });
        }

        // Verify PIN
        const person = await prisma.person.findUnique({
            where: { id: personId },
            select: { secretPin: true }
        });

        if (!person) {
            return NextResponse.json({ error: 'Person not found' }, { status: 404 });
        }

        if (person.secretPin !== pin) {
            return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
        }

        // Delete person
        await prisma.person.delete({
            where: { id: personId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}