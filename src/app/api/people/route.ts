import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const people = await prisma.person.findMany({
            orderBy: { lastName: 'asc' },
        });

        return NextResponse.json(people);
    } catch (error) {
        console.error('Failed to fetch people:', error);
        return NextResponse.json(
            { error: 'Failed to fetch people' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate required field
        if (!body.secretPin) {
            return NextResponse.json(
                { error: 'Secret PIN is required' },
                { status: 400 }
            );
        }

        const person = await prisma.person.create({
            data: {
                firstName: body.firstName || null,
                lastName: body.lastName || null,
                email: body.email || null,
                phoneNumber: body.phoneNumber || null,
                age: body.age || null,
                placeOfBirth: body.placeOfBirth || null,
                recruitNumber: body.recruitNumber || null,
                photo: body.photo || null,
                instagram: body.instagram || null,
                twitter: body.twitter || null,
                tikTok: body.tikTok || null,
                hobbies: body.hobbies || [],
                favoriteMovie: body.favoriteMovie || null,
                favoriteTravelDestination: body.favoriteTravelDestination || null,
                favoriteFood: body.favoriteFood || null,
                favoriteMusicGenreArtist: body.favoriteMusicGenreArtist || null,
                bestConcertEvent: body.bestConcertEvent || null,
                karaokeSong: body.karaokeSong || null,
                weekendActivity: body.weekendActivity || null,
                favoriteAnimal: body.favoriteAnimal || null,
                funFact: body.funFact || null,
                hiddenTalent: body.hiddenTalent || null,
                previousWorkExperience: body.previousWorkExperience || null,
                biography: body.biography || null,
                secretPin: body.secretPin,
            },
        });

        return NextResponse.json(person, { status: 201 });
    } catch (error) {
        console.error('Failed to create person:', error);
        return NextResponse.json(
            { error: 'Failed to create person' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, secretPin, ...updateData } = body;

        if (!id || !secretPin) {
            return NextResponse.json(
                { error: 'ID and secret PIN are required' },
                { status: 400 }
            );
        }

        // Verify PIN
        const person = await prisma.person.findUnique({
            where: { id: parseInt(id) },
        });

        if (!person) {
            return NextResponse.json(
                { error: 'Person not found' },
                { status: 404 }
            );
        }

        if (person.secretPin !== secretPin) {
            return NextResponse.json(
                { error: 'Invalid PIN' },
                { status: 401 }
            );
        }

        // Update person
        const updatedPerson = await prisma.person.update({
            where: { id: parseInt(id) },
            data: {
                firstName: updateData.firstName || null,
                lastName: updateData.lastName || null,
                email: updateData.email || null,
                phoneNumber: updateData.phoneNumber || null,
                age: updateData.age || null,
                placeOfBirth: updateData.placeOfBirth || null,
                recruitNumber: updateData.recruitNumber || null,
                photo: updateData.photo || null,
                instagram: updateData.instagram || null,
                twitter: updateData.twitter || null,
                tikTok: updateData.tikTok || null,
                hobbies: updateData.hobbies || [],
                favoriteMovie: updateData.favoriteMovie || null,
                favoriteTravelDestination: updateData.favoriteTravelDestination || null,
                favoriteFood: updateData.favoriteFood || null,
                favoriteMusicGenreArtist: updateData.favoriteMusicGenreArtist || null,
                bestConcertEvent: updateData.bestConcertEvent || null,
                karaokeSong: updateData.karaokeSong || null,
                weekendActivity: updateData.weekendActivity || null,
                favoriteAnimal: updateData.favoriteAnimal || null,
                funFact: updateData.funFact || null,
                hiddenTalent: updateData.hiddenTalent || null,
                previousWorkExperience: updateData.previousWorkExperience || null,
                biography: updateData.biography || null,
            },
        });

        return NextResponse.json(updatedPerson);
    } catch (error) {
        console.error('Failed to update person:', error);
        return NextResponse.json(
            { error: 'Failed to update person' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const secretPin = searchParams.get('secretPin');

        if (!id || !secretPin) {
            return NextResponse.json(
                { error: 'ID and secret PIN are required' },
                { status: 400 }
            );
        }

        // Verify PIN
        const person = await prisma.person.findUnique({
            where: { id: parseInt(id) },
        });

        if (!person) {
            return NextResponse.json(
                { error: 'Person not found' },
                { status: 404 }
            );
        }

        if (person.secretPin !== secretPin) {
            return NextResponse.json(
                { error: 'Invalid PIN' },
                { status: 401 }
            );
        }

        // Delete person
        await prisma.person.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete person:', error);
        return NextResponse.json(
            { error: 'Failed to delete person' },
            { status: 500 }
        );
    }
}