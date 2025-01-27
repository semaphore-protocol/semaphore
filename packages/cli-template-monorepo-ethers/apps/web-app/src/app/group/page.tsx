"use client"
import Stepper from "@/components/Stepper"
import { useLogContext } from "@/context/LogContext"
import { useSemaphoreContext } from "@/context/SemaphoreContext"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo } from "react"
import Feedback from "../../../contract-artifacts/Feedback.json"
import { ethers } from "ethers"
import useSemaphoreIdentity from "@/hooks/useSemaphoreIdentity"
import { useState } from "react"

export default function GroupsPage() {
    const router = useRouter()
    const { setLog } = useLogContext()
    const { _users, refreshUsers, addUser } = useSemaphoreContext()
    const [_loading, setLoading] = useState(false)
    const { _identity } = useSemaphoreIdentity()

    useEffect(() => {
        if (_users.length > 0) {
            setLog(`${_users.length} user${_users.length > 1 ? "s" : ""} retrieved from the group 🤙🏽`)
        }
    }, [_users, setLog])

    const users = useMemo(() => [..._users].reverse(), [_users])

    const joinGroup = useCallback(async () => {
        if (!_identity) {
            return
        }

        setLoading(true)
        setLog(`Joining the Feedback group...`)

        let joinedGroup: boolean = false

        if (process.env.NEXT_PUBLIC_OPENZEPPELIN_AUTOTASK_WEBHOOK) {
            const response = await fetch(process.env.NEXT_PUBLIC_OPENZEPPELIN_AUTOTASK_WEBHOOK, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    abi: Feedback.abi,
                    address: process.env.NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS as string,
                    functionName: "joinGroup",
                    functionParameters: [_identity.commitment.toString()]
                })
            })

            if (response.status === 200) {
                joinedGroup = true
            }
        } else if (
            process.env.NEXT_PUBLIC_GELATO_RELAYER_ENDPOINT &&
            process.env.NEXT_PUBLIC_GELATO_RELAYER_CHAIN_ID &&
            process.env.GELATO_RELAYER_API_KEY
        ) {
            const iface = new ethers.Interface(Feedback.abi)
            const request = {
                chainId: process.env.NEXT_PUBLIC_GELATO_RELAYER_CHAIN_ID,
                target: process.env.NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS,
                data: iface.encodeFunctionData("joinGroup", [_identity.commitment.toString()]),
                sponsorApiKey: process.env.GELATO_RELAYER_API_KEY
            }
            const response = await fetch(process.env.NEXT_PUBLIC_GELATO_RELAYER_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request)
            })

            if (response.status === 201) {
                joinedGroup = true
            }
        } else {
            const response = await fetch("api/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identityCommitment: _identity.commitment.toString()
                })
            })

            if (response.status === 200) {
                joinedGroup = true
            }
        }

        if (joinedGroup) {
            addUser(_identity.commitment.toString())

            setLog(`You have joined the Feedback group event 🎉 Share your feedback anonymously!`)
        } else {
            setLog("Some error occurred, please try again!")
        }

        setLoading(false)
    }, [_identity, addUser, setLoading, setLog])

    const userHasJoined = useMemo(
        () => _identity !== undefined && _users.includes(_identity.commitment.toString()),
        [_identity, _users]
    )

    return (
        <>
            <h2>Groups</h2>

            <p>
                <a
                    href="https://docs.semaphore.pse.dev/guides/groups"
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                >
                    Semaphore groups
                </a>{" "}
                are{" "}
                <a
                    href="https://zkkit.pse.dev/classes/_zk_kit_lean_imt.LeanIMT.html"
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                >
                    Lean incremental Merkle trees
                </a>{" "}
                in which each leaf contains an identity commitment for a user. Groups can be abstracted to represent
                events, polls, or organizations.
            </p>

            <div className="divider"></div>

            <div className="text-top">
                <h3 className="users-header">Group users ({_users.length})</h3>
                <button className="refresh-button" onClick={refreshUsers}>
                    <span className="refresh-span">
                        <svg viewBox="0 0 24 24" focusable="false" className="refresh-icon">
                            <path
                                fill="currentColor"
                                d="M5.463 4.43301C7.27756 2.86067 9.59899 1.99666 12 2.00001C17.523 2.00001 22 6.47701 22 12C22 14.136 21.33 16.116 20.19 17.74L17 12H20C20.0001 10.4316 19.5392 8.89781 18.6747 7.58927C17.8101 6.28072 16.5799 5.25517 15.1372 4.64013C13.6944 4.0251 12.1027 3.84771 10.56 4.13003C9.0172 4.41234 7.59145 5.14191 6.46 6.22801L5.463 4.43301ZM18.537 19.567C16.7224 21.1393 14.401 22.0034 12 22C6.477 22 2 17.523 2 12C2 9.86401 2.67 7.88401 3.81 6.26001L7 12H4C3.99987 13.5684 4.46075 15.1022 5.32534 16.4108C6.18992 17.7193 7.42007 18.7449 8.86282 19.3599C10.3056 19.9749 11.8973 20.1523 13.44 19.87C14.9828 19.5877 16.4085 18.8581 17.54 17.772L18.537 19.567Z"
                            ></path>
                        </svg>
                    </span>
                    Refresh
                </button>
            </div>

            {_users.length > 0 && (
                <div className="users-wrapper">
                    {users.map((user, i) => (
                        <div key={i}>
                            <p className="box box-text">
                                {_identity?.commitment.toString() === user ? <b>{user}</b> : user}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <div className="join-group-button">
                <button
                    className="button"
                    onClick={joinGroup}
                    disabled={_loading || !_identity || userHasJoined}
                    type="button"
                >
                    <span>Join group</span>
                    {_loading && <div className="loader"></div>}
                </button>
            </div>

            <div className="divider" />

            <Stepper
                step={2}
                onPrevClick={() => router.push("/")}
                onNextClick={userHasJoined ? () => router.push("/proofs") : undefined}
            />
        </>
    )
}
