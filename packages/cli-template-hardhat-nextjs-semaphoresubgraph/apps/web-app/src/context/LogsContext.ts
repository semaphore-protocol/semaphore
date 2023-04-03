import React from "react"

export type LogsContextType = {
    _logs: string
    setLogs: (logs: string) => void
}

export default React.createContext<LogsContextType>({
    _logs: "",
    setLogs: (logs: string) => logs
})
