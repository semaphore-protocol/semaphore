import PageContainer from "@/components/PageContainer"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Semaphore Demo",
    description: "A zero-knowledge protocol for anonymous signaling on Ethereum.",
    icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
    metadataBase: new URL("https://demo.semaphore.pse.dev"),
    openGraph: {
        type: "website",
        url: "https://demo.semaphore.pse.dev",
        title: "Semaphore Demo",
        description: "A zero-knowledge protocol for anonymous signaling on Ethereum.",
        siteName: "Semaphore Demo",
        images: [
            {
                url: "https://demo.semaphore.pse.dev/social-media.png"
            }
        ]
    },
    twitter: { card: "summary_large_image", images: "https://demo.semaphore.pse.dev/social-media.png" }
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning className={inter.className}>
                <PageContainer>{children}</PageContainer>
            </body>
        </html>
    )
}
