import { Box, Container, Link } from "@chakra-ui/react"
import type { Metadata } from "next"
import Script from "next/script"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import Providers from "./providers"
import Banner from "@/components/Banner"

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
                    <Banner>
                        Semaphore V4
                        <Link
                            _hover={{
                                textDecoration: "underline",
                                textDecorationColor: "primary.600"
                            }}
                            href="https://ceremony.pse.dev/projects/Semaphore%20Binary%20Merkle%20Root%20Fix"
                            ml="1"
                            isExternal
                            color="primary.500"
                        >
                            <b>Trusted Setup Ceremony</b>
                        </Link>{" "}
                        is open for contributions until <b>August 20</b>!
                    </Banner>
                    <Navbar />
                    <Container maxW="1440px" px={{ base: "5", md: "10" }}>
                        <Box h="146px" /> {/* Adjusted to account for TopBanner and Navbar */}
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
