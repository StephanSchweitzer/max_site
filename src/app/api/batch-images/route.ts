import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs'

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

        // Fetch image metadata from database
        const images = await prisma.image.findMany({
            select: {
                id: true,
                url: true,
            },
        })

        // Load all images and convert to base64
        const imagesWithData = await Promise.all(
            images.map(async (image) => {
                try {
                    // Extract filename from URL (assuming format: /api/protected-image/filename.jpg)
                    const filename = image.url.split('/').pop()
                    if (!filename) throw new Error('Invalid URL format')

                    // Build path to image in private-images folder
                    const imagePath = path.join(process.cwd(), 'private-images', filename)

                    // Check if file exists
                    if (!fs.existsSync(imagePath)) {
                        console.warn(`Image not found: ${imagePath}`)
                        return null
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

                    // Convert to base64
                    const base64Data = imageBuffer.toString('base64')
                    const dataUrl = `data:${contentType};base64,${base64Data}`

                    return {
                        id: image.id,
                        url: image.url,
                        data: dataUrl,
                        filename: filename,
                        contentType: contentType
                    }
                } catch (error) {
                    console.error(`Error loading image ${image.url}:`, error)
                    return null
                }
            })
        )

        // Filter out any failed images
        const validImages = imagesWithData.filter(img => img !== null)

        return NextResponse.json({
            images: validImages,
            count: validImages.length
        })

    } catch (error) {
        console.error('Error serving batch images:', error)
        return NextResponse.json(
            { error: 'Failed to serve images' },
            { status: 500 }
        )
    }
}

// Also support POST method with password in body
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

        // Same logic as GET method for loading images...
        // Fetch image metadata from database
        const images = await prisma.image.findMany({
            select: {
                id: true,
                url: true,
            },
        })

        // Load all images and convert to base64
        const imagesWithData = await Promise.all(
            images.map(async (image) => {
                try {
                    const filename = image.url.split('/').pop()
                    if (!filename) throw new Error('Invalid URL format')

                    const imagePath = path.join(process.cwd(), 'private-images', filename)

                    if (!fs.existsSync(imagePath)) {
                        console.warn(`Image not found: ${imagePath}`)
                        return null
                    }

                    const imageBuffer = fs.readFileSync(imagePath)

                    const ext = path.extname(filename).toLowerCase()
                    let contentType = 'image/jpeg'

                    switch (ext) {
                        case '.png': contentType = 'image/png'; break
                        case '.gif': contentType = 'image/gif'; break
                        case '.webp': contentType = 'image/webp'; break
                        case '.svg': contentType = 'image/svg+xml'; break
                        case '.jpg':
                        case '.jpeg': contentType = 'image/jpeg'; break
                    }

                    const base64Data = imageBuffer.toString('base64')
                    const dataUrl = `data:${contentType};base64,${base64Data}`

                    return {
                        id: image.id,
                        url: image.url,
                        data: dataUrl,
                        filename: filename,
                        contentType: contentType
                    }
                } catch (error) {
                    console.error(`Error loading image ${image.url}:`, error)
                    return null
                }
            })
        )

        const validImages = imagesWithData.filter(img => img !== null)

        return NextResponse.json({
            images: validImages,
            count: validImages.length
        })

    } catch (error) {
        console.error('Error serving batch images:', error)
        return NextResponse.json(
            { error: 'Failed to serve images' },
            { status: 500 }
        )
    }
}