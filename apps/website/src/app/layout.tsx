import { Box, Container } from "@chakra-ui/react"
import type { Metadata } from "next"
import Script from "next/script"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import Providers from "./providers"

export const metadata: Metadata = {
    title: "Semaphore",
    description: "A zero-knowledge protocol for anonymous signaling on Ethereum.",
    icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
    metadataBase: new URL("https://semaphore.pse.dev"),
    openGraph: {
        type: "website",
        url: "https://semaphore.pse.dev",
        title: "Semaphore",
        description: "A zero-knowledge protocol for anonymous signaling on Ethereum.",
        siteName: "Semaphore",
        images: [
            {
                url: "https://semaphore.pse.dev/social-media.png"
            }
        ]
    },
    twitter: { card: "summary_large_image", images: "https://semaphore.pse.dev/social-media.png" }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <Providers>
                    <Navbar />
                    <Container maxW="1440px" px={{ base: "5", md: "10" }}>
                        <Box h="96px" />
                        {children}
                        <Footer />
                    </Container>
                </Providers>
            </body>

            <Script id="matomo-tracking" strategy="afterInteractive">
                {`
                    var _paq = window._paq = window._paq || [];
                    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
                    _paq.push(['trackPageView']);
                    _paq.push(['enableLinkTracking']);
                    (function() {
                        var u="https://psedev.matomo.cloud/";
                        _paq.push(['setTrackerUrl', u+'matomo.php']);
                        _paq.push(['setSiteId', '10']);
                        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                        g.async=true; g.src='//cdn.matomo.cloud/psedev.matomo.cloud/matomo.js'; s.parentNode.insertBefore(g,s);
                    })();
                `}
            </Script>
        </html>
    )
}
