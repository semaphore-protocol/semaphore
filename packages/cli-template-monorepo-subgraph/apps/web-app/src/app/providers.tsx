"use client"

import { CacheProvider } from "@chakra-ui/next-js"
import { ChakraProvider } from "@chakra-ui/react"
import theme from "../styles/index"

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CacheProvider>
            <ChakraProvider theme={theme}>{children}</ChakraProvider>
        </CacheProvider>
    )
}
