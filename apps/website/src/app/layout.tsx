import type { Metadata } from "next"
import Providers from "./providers"

export const metadata: Metadata = {
    title: "Semaphore",
    description: "A zero-knowledge protocol for anonymous signaling on Ethereum."
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body suppressHydrationWarning={true}>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
