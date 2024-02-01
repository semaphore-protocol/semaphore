import { SemaphoreSubgraph } from "@semaphore-protocol/data"
import { decodeBytes32String, toBeHex } from "ethers"
import getNextConfig from "next/config"
import { useCallback, useState } from "react"
import { SemaphoreContextType } from "../context/SemaphoreContext"

const { publicRuntimeConfig: env } = getNextConfig()

const ethereumNetwork = env.DEFAULT_NETWORK === "localhost" ? "http://127.0.0.1:8545" : env.DEFAULT_NETWORK

export default function useSemaphore(): SemaphoreContextType {
    const [_users, setUsers] = useState<any[]>([])
    const [_feedback, setFeedback] = useState<string[]>([])

    const refreshUsers = useCallback(async (): Promise<void> => {
        const semaphore = new SemaphoreSubgraph(ethereumNetwork)

        const group = await semaphore.getGroup(env.GROUP_ID, { members: true })

        setUsers(group.members!)
    }, [])

    const addUser = useCallback(
        (user: any) => {
            setUsers([..._users, user])
        },
        [_users]
    )

    const refreshFeedback = useCallback(async (): Promise<void> => {
        const semaphore = new SemaphoreSubgraph(ethereumNetwork)

        const group = await semaphore.getGroup(env.GROUP_ID, {
            validatedProofs: true
        })

        setFeedback(group.validatedProofs!.map(({ message }: any) => decodeBytes32String(toBeHex(message, 32))))
    }, [])

    const addFeedback = useCallback(
        (feedback: string) => {
            setFeedback([..._feedback, feedback])
        },
        [_feedback]
    )

    return {
        _users,
        _feedback,
        refreshUsers,
        addUser,
        refreshFeedback,
        addFeedback
    }
}
