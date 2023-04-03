import "../styles/globals.css"
import { Network } from "@semaphore-protocol/data"
import type { AppProps } from "next/app"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import LogsContext from "../context/LogsContext"
import SemaphoreContext from "../context/SemaphoreContext"
import useSemaphore from "../hooks/useSemaphore"
import { Inter } from "@next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter()
    const semaphore = useSemaphore()
    const [_logs, setLogs] = useState<string>("")

    useEffect(() => {
        semaphore.refreshUsers()
        semaphore.refreshFeedback()
    }, [])

    function shortenAddress(address: string) {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    function getExplorerLink(network: Network, address: string) {
        switch (network) {
            case "goerli":
            case "sepolia":
                return `https://${network}.etherscan.io/address/${address}`
            case "arbitrum-goerli":
                return `https://goerli.arbiscan.io/address/${address}`
            default:
                return ""
        }
    }

    return (
        <div className={inter.className}>
            <Head>
                <title>Semaphore template</title>
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#ebedff" />
            </Head>

            <div>
                <div className="container">
                    <div id="body">
                        <SemaphoreContext.Provider value={semaphore}>
                            <LogsContext.Provider
                                value={{
                                    _logs,
                                    setLogs
                                }}
                            >
                                <Component {...pageProps} />
                            </LogsContext.Provider>
                        </SemaphoreContext.Provider>
                    </div>
                </div>

                <div className="footer">
                    {_logs.endsWith("...")}
                    <p>{_logs || `Current step: ${router.route}`}</p>
                </div>
            </div>
        </div>
    )
}
