import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const QUIZ_FIELDS = [
    'previousWorkExperience',
    'biography',
    'funFact',
    'age',
    'placeOfBirth',
    'favoriteMovie',
    'favoriteTravelDestination',
    'favoriteFood',
    'favoriteMusicGenreArtist',
    'bestConcertEvent',
    'karaokeSong',
    'weekendActivity',
    'favoriteAnimal',
    'hiddenTalent',
];

interface QuizQuestion {
    id: string;
    field: string;
    questionText: string;
    value: string;
    people: Array<{
        id: number;
        firstName: string;
        lastName: string;
        photo: string | null;
    }>;
    correctAnswerIds: number[];
}

export async function GET() {
    try {
        const allPeople = await prisma.person.findMany();

        if (allPeople.length < 4) {
            return NextResponse.json(
                { error: 'Need at least 4 people in database' },
                { status: 400 }
            );
        }

        const questions: QuizQuestion[] = [];
        const usedCombinations = new Set<string>();

        let attempts = 0;
        const maxAttempts = 100;

        while (questions.length < 10 && attempts < maxAttempts) {
            attempts++;

            // Get 4 random people
            const shuffled = [...allPeople].sort(() => Math.random() - 0.5);
            const selectedPeople = shuffled.slice(0, 4);

            // Pick a random field
            const field = QUIZ_FIELDS[Math.floor(Math.random() * QUIZ_FIELDS.length)];

            // Get values for this field from selected people
            const peopleWithValues = selectedPeople
                .map((person) => {
                    let value: any = person[field as keyof typeof person];

                    // Handle hobbies array - pick one random hobby
                    if (field === 'hobbies' && Array.isArray(value) && value.length > 0) {
                        value = value[Math.floor(Math.random() * value.length)];
                    }

                    // Convert to string and trim
                    if (value !== null && value !== undefined) {
                        value = String(value).trim();
                    }

                    return { person, value };
                })
                .filter((item) => item.value && item.value !== '');

            if (peopleWithValues.length === 0) continue;

            // Pick a random value from those available
            const selectedItem = peopleWithValues[Math.floor(Math.random() * peopleWithValues.length)];
            const questionValue = selectedItem.value;

            // Find all people who have this same value
            const correctAnswers = selectedPeople.filter((person) => {
                let personValue: any = person[field as keyof typeof person];

                if (field === 'hobbies' && Array.isArray(personValue)) {
                    return personValue.some(
                        (hobby) => hobby.trim().toLowerCase() === questionValue.toLowerCase()
                    );
                }

                if (personValue !== null && personValue !== undefined) {
                    personValue = String(personValue).trim();
                    return personValue.toLowerCase() === questionValue.toLowerCase();
                }

                return false;
            });

            if (correctAnswers.length === 0) continue;

            // Create unique key for this question
            const sortedIds = selectedPeople.map((p) => p.id).sort().join(',');
            const questionKey = `${field}-${questionValue.toLowerCase()}-${sortedIds}`;

            if (usedCombinations.has(questionKey)) continue;
            usedCombinations.add(questionKey);

            // Create question text
            const questionText = getQuestionText(field, questionValue);

            questions.push({
                id: `q-${questions.length + 1}`,
                field,
                questionText,
                value: questionValue,
                people: selectedPeople.map((p) => ({
                    id: p.id,
                    firstName: p.firstName,
                    lastName: p.lastName,
                    photo: p.photo,
                })),
                correctAnswerIds: correctAnswers.map((p) => p.id),
            });
        }

        if (questions.length < 10) {
            return NextResponse.json(
                { error: 'Could not generate enough unique questions' },
                { status: 400 }
            );
        }

        return NextResponse.json({ questions });
    } catch (error) {
        console.error('Quiz generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate quiz' },
            { status: 500 }
        );
    }
}

function getQuestionText(field: string, value: string): string {
    const fieldLabels: Record<string, string> = {
        previousWorkExperience: 'Previous work experience',
        biography: 'Biography includes',
        funFact: 'Fun fact',
        age: 'Age',
        placeOfBirth: 'Place of birth',
        hobbies: 'Hobby',
        favoriteMovie: 'Favorite movie',
        favoriteTravelDestination: 'Favorite travel destination',
        favoriteFood: 'Favorite food',
        favoriteMusicGenreArtist: 'Favorite music/artist',
        bestConcertEvent: 'Best concert/event',
        karaokeSong: 'Karaoke song',
        weekendActivity: 'Weekend activity',
        favoriteAnimal: 'Favorite animal',
        hiddenTalent: 'Hidden talent',
    };

    return `${fieldLabels[field] || field}: ${value}`;
}