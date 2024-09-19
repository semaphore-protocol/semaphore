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
                    href="https://zkkit.pse.dev/classes/_zk_kit_imt.LeanIMT.html"
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
                <h3>Group users ({_users.length})</h3>
                <button className="button-link" onClick={refreshUsers}>
                    Refresh
                </button>
            </div>

            {_users.length > 0 && (
                <div>
                    {users.map((user, i) => (
                        <div key={i}>
                            <p className="box box-text">
                                {_identity?.commitment.toString() === user ? <b>{user}</b> : user}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <div>
                <button
                    className="button"
                    onClick={joinGroup}
                    disabled={_loading || !_identity || userHasJoined}
                    type="button"
                >
                    <span>Join group</span>
                    {_loading && <div className="loader" />}
                </button>
            </div>

            <div className="divider" />

            <Stepper step={2} onPrevClick={() => router.push("/")} onNextClick={() => router.push("/proofs")} />
        </>
    )
}
