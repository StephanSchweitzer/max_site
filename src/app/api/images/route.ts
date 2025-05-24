import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const images = await prisma.image.findMany({
            select: {
                id: true,
                url: true,
            },
        })
        return NextResponse.json(images)
    } catch (error) {
        console.error('Error fetching images:', error)
        return NextResponse.json(
            { error: 'Failed to fetch images' },
            { status: 500 }
        )
    }
}