import {del, put} from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        const blob = await put(file.name, file, {
            access: 'public',
            addRandomSuffix: true,
        });

        return NextResponse.json({ url: blob.url });
    } catch (error) {
        console.error('Failed to upload photo:', error);
        return NextResponse.json(
            { error: 'Failed to upload photo' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { url } = await request.json();
        await del(url);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete photo:', error);
        return NextResponse.json(
            { error: 'Failed to delete photo' },
            { status: 500 }
        );
    }
}