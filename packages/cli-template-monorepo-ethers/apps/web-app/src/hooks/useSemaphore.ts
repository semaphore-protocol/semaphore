import { SemaphoreEthers } from "@semaphore-protocol/data"
import { decodeBytes32String, toBeHex } from "ethers"
import { useCallback, useState } from "react"
import { SemaphoreContextType } from "../context/SemaphoreContext"

const ethereumNetwork =
    process.env.NEXT_PUBLIC_DEFAULT_NETWORK === "localhost"
        ? "http://127.0.0.1:8545"
        : process.env.NEXT_PUBLIC_DEFAULT_NETWORK

export default function useSemaphore(): SemaphoreContextType {
    const [_users, setUsers] = useState<string[]>([])
    const [_feedback, setFeedback] = useState<string[]>([])

    const refreshUsers = useCallback(async (): Promise<void> => {
        const semaphore = new SemaphoreEthers(ethereumNetwork, {
            address: process.env.NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS
        })

        const members = await semaphore.getGroupMembers(process.env.NEXT_PUBLIC_GROUP_ID as string)

        setUsers(members)
    }, [])

    const addUser = useCallback(
        (user: any) => {
            setUsers([..._users, user])
        },
        [_users]
    )

    const refreshFeedback = useCallback(async (): Promise<void> => {
        const semaphore = new SemaphoreEthers(ethereumNetwork, {
            address: process.env.NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS
        })

        const proofs = await semaphore.getGroupValidatedProofs(process.env.NEXT_PUBLIC_GROUP_ID as string)

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
