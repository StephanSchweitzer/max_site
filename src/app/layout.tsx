import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        {children}
        <Toaster
            position="bottom-right"
            richColors
            closeButton
            duration={3000}
        />
        </body>
        </html>
    )
}