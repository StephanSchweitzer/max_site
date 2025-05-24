import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json()

        const storedPassword = await prisma.password.findUnique({
            where: { password: password },
        })

        if (storedPassword) {
            return NextResponse.json({ valid: true })
        } else {
            return NextResponse.json({ valid: false })
        }
    } catch (error) {
        console.error('Error checking password:', error)
        return NextResponse.json(
            { error: 'Failed to check password' },
            { status: 500 }
        )
    }
}