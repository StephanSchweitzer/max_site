import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Mr. Max Pruitt',
    description: 'Everything a man could need to know about me',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    )
}