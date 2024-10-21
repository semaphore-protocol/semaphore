"use client"

import React, { createContext, ReactNode, useContext, useState } from "react"

export type LogContextType = {
    log: string
    setLog: (logs: string) => void
}

const LogContext = createContext<LogContextType | null>(null)

interface ProviderProps {
    children: ReactNode
}

export const LogContextProvider: React.FC<ProviderProps> = ({ children }) => {
    const [log, setLog] = useState<string>("")

    return (
        <LogContext.Provider
            value={{
                log,
                setLog
            }}
        >
            {children}
        </LogContext.Provider>
    )
}

export const useLogContext = () => {
    const context = useContext(LogContext)
    if (context === null) {
        throw new Error("LogContext must be used within a LogContextProvider")
    }
    return context
}
