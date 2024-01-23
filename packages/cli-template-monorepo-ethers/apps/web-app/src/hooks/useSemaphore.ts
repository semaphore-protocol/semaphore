import { SemaphoreEthers } from "@semaphore-protocol/data"
import { decodeBytes32String, toBeHex } from "ethers"
import getNextConfig from "next/config"
import { useCallback, useState } from "react"
import { SemaphoreContextType } from "../context/SemaphoreContext"

const { publicRuntimeConfig: env } = getNextConfig()

const ethereumNetwork = env.DEFAULT_NETWORK === "localhost" ? "http://localhost:8545" : env.DEFAULT_NETWORK

export default function useSemaphore(): SemaphoreContextType {
    const [_users, setUsers] = useState<any[]>([])
    const [_feedback, setFeedback] = useState<string[]>([])

    const refreshUsers = useCallback(async (): Promise<void> => {
        const semaphore = new SemaphoreEthers(ethereumNetwork, {
            address: env.SEMAPHORE_CONTRACT_ADDRESS
        })

        const members = await semaphore.getGroupMembers(env.GROUP_ID)

        setUsers(members.map((member) => member.toString()))
    }, [])

    const addUser = useCallback(
        (user: any) => {
            setUsers([..._users, user])
        },
        [_users]
    )

    const refreshFeedback = useCallback(async (): Promise<void> => {
        const semaphore = new SemaphoreEthers(ethereumNetwork, {
            address: env.SEMAPHORE_CONTRACT_ADDRESS
        })

        const proofs = await semaphore.getGroupValidatedProofs(env.GROUP_ID)

        setFeedback(proofs.map(({ message }: any) => decodeBytes32String(toBeHex(message, 32))))
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
