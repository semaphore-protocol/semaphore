import PageContainer from "@/components/PageContainer"
import type { Metadata } from "next"
import { LogContextProvider } from "@/context/LogContext"
import { SemaphoreContextProvider } from "@/context/SemaphoreContext"
import "./globals.css"

import { Inter } from "next/font/google"
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
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com"></link>
                <link rel="preconnect" href="https://fonts.gstatic.com"></link>
                <link
                    href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap"
                    rel="stylesheet"
                ></link>
            </head>
            <body suppressHydrationWarning className={inter.className}>
                <SemaphoreContextProvider>
                    <LogContextProvider>
                        <PageContainer>{children}</PageContainer>
                    </LogContextProvider>
                </SemaphoreContextProvider>
            </body>
        </html>
    )
}
