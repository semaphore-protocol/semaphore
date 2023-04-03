import React from "react"

export type SemaphoreContextType = {
    _users: string[]
    _feedback: string[]
    refreshUsers: () => Promise<void>
    addUser: (user: string) => void
    refreshFeedback: () => Promise<void>
    addFeedback: (feedback: string) => void
}

export default React.createContext<SemaphoreContextType>({
    _users: [],
    _feedback: [],
    refreshUsers: () => Promise.resolve(),
    addUser: () => {},
    refreshFeedback: () => Promise.resolve(),
    addFeedback: () => {}
})
