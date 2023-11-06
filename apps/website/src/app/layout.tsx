import { Container } from "@chakra-ui/react"
import type { Metadata } from "next"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import Providers from "./providers"

export const metadata: Metadata = {
    title: "Semaphore",
    description: "A zero-knowledge protocol for anonymous signaling on Ethereum."
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
