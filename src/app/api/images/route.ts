import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        // Get password from different possible sources
        const { searchParams } = new URL(request.url)
        const passwordFromQuery = searchParams.get('password')
        const passwordFromHeader = request.headers.get('authorization')?.replace('Bearer ', '')
        const password = passwordFromQuery || passwordFromHeader

        // Check countdown condition - unlocks next Friday
        const unlockTime = new Date('2025-05-30T00:00:00Z') // Friday, May 30, 2025
        const now = new Date()
        const countdownExpired = now >= unlockTime

        let accessGranted = false

        // Check if countdown has expired (images become public)
        if (countdownExpired) {
            accessGranted = true
        }
        // Otherwise, check password
        else if (password) {
            const storedPassword = await prisma.password.findUnique({
                where: { password: password },
            })

            if (storedPassword) {
                accessGranted = true
            }
        }

        // Deny access if neither condition is met
        if (!accessGranted) {
            return NextResponse.json(
                {
                    error: 'Access denied',
                    message: 'Valid password required or wait for countdown to expire',
                    timeRemaining: countdownExpired ? 0 : unlockTime.getTime() - now.getTime()
                },
                { status: 403 }
            )
        }

        // Fetch and return images if access is granted
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

// Optional: Also handle POST requests with password in body
export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json()

        // Check countdown - unlocks next Friday
        const unlockTime = new Date('2025-05-30T00:00:00Z')
        const now = new Date()
        const countdownExpired = now >= unlockTime

        let accessGranted = false

        if (countdownExpired) {
            accessGranted = true
        } else if (password) {
            const storedPassword = await prisma.password.findUnique({
                where: { password: password },
            })
            accessGranted = !!storedPassword
        }

        if (!accessGranted) {
            return NextResponse.json(
                {
                    error: 'Access denied',
                    timeRemaining: countdownExpired ? 0 : unlockTime.getTime() - now.getTime()
                },
                { status: 403 }
            )
        }

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