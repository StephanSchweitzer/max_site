import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        // Await params to fix Next.js 15 requirement
        const { filename } = await params
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

        // Build path to image in private-images folder
        const imagePath = path.join(process.cwd(), 'private-images', filename)

        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            )
        }

        // Read the image file
        const imageBuffer = fs.readFileSync(imagePath)

        // Determine content type based on file extension
        const ext = path.extname(filename).toLowerCase()
        let contentType = 'image/jpeg' // default

        switch (ext) {
            case '.png':
                contentType = 'image/png'
                break
            case '.gif':
                contentType = 'image/gif'
                break
            case '.webp':
                contentType = 'image/webp'
                break
            case '.svg':
                contentType = 'image/svg+xml'
                break
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg'
                break
        }

        // Return the image with appropriate headers
        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'private, no-cache', // Prevent caching since access is protected
            },
        })

    } catch (error) {
        console.error('Error serving image:', error)
        return NextResponse.json(
            { error: 'Failed to serve image' },
            { status: 500 }
        )
    }
}