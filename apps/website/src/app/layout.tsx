import { Container } from "@chakra-ui/react"
import type { Metadata } from "next"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import Providers from "./providers"

export const metadata: Metadata = {
    title: "Semaphore",
    description: "A zero-knowledge protocol for anonymous signaling on Ethereum.",
    icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
    metadataBase: new URL("https://website.semaphore.pse.dev"),
    openGraph: {
        type: "website",
        url: "https://website.semaphore.pse.dev",
        title: "Semaphore",
        description: "A zero-knowledge protocol for anonymous signaling on Ethereum.",
        siteName: "Semaphore",
        images: [
            {
                url: "/social-media.png"
            }
        ]
    },
    twitter: { card: "summary_large_image", images: "/social-media.png" }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body suppressHydrationWarning={true}>
                <Providers>
                    <Container maxW="1440px" px={{ base: "5", md: "10" }}>
                        <Navbar />
                        {children}
                        <Footer />
                    </Container>
                </Providers>
            </body>
        </html>
    )
}
