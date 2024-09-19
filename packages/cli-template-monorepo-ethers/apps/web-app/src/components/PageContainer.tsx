"use client"

import { useLogContext } from "@/context/LogContext"
import shortenString from "@/utils/shortenString"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function PageContainer({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    const pathname = usePathname()
    const { log } = useLogContext()

    function getExplorerLink(network: string, address: string) {
        switch (network) {
            case "sepolia":
                return `https://sepolia.etherscan.io/address/${address}`
            case "arbitrum-sepolia":
                return `https://sepolia.arbiscan.io/address/${address}`
            default:
                return ""
        }
    }

    return (
        <>
            <div className="header">
                <div className="header-left">
                    {/* <Link href="/" className="header-left">
                        Feedback
                    </Link> */}
                </div>
                <div className="header-right">
                    <a
                        href={getExplorerLink(
                            process.env.NEXT_PUBLIC_DEFAULT_NETWORK as string,
                            process.env.NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS as string
                        )}
                        target="_blank"
                        rel="noreferrer noopener nofollow"
                    >
                        <div>{shortenString(process.env.NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS as string, [6, 4])}</div>
                    </a>
                    <a
                        href="https://github.com/semaphore-protocol/semaphore"
                        target="_blank"
                        rel="noreferrer noopener nofollow"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-github"
                        >
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        </svg>
                    </a>
                </div>
            </div>

            <div className="container">{children}</div>

            <div className="divider-footer" />

            <div className="footer">
                {log.endsWith("...")}
                <p>{log || `Current step: ${pathname}`}</p>
            </div>
        </>
    )
}
