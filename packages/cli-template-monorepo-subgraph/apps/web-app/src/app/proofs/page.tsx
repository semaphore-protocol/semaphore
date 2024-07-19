"use client"

import { Group, Identity, generateProof } from "@semaphore-protocol/core"
import { useRouter } from "next/navigation"
import { useCallback, useContext, useEffect, useState } from "react"
import Feedback from "../../../contract-artifacts/Feedback.json"
import Stepper from "../../components/Stepper"
import LogsContext from "../../context/LogsContext"
import SemaphoreContext from "../../context/SemaphoreContext"

export default function ProofsPage() {
    const router = useRouter()
    const { setLogs } = useContext(LogsContext)
    const { _users, _feedback, refreshFeedback, addFeedback } = useContext(SemaphoreContext)
    const [_loading, setLoading] = useState(false)
    const [_identity, setIdentity] = useState<Identity>()

    useEffect(() => {
        const privateKey = localStorage.getItem("identity")

        if (!privateKey) {
            router.push("/")
            return
        }

        setIdentity(new Identity(privateKey))
    }, [router])

    useEffect(() => {
        if (_feedback.length > 0) {
            setLogs(`${_feedback.length} feedback retrieved from the group 🤙🏽`)
        }
    }, [_feedback, setLogs])

    const sendFeedback = useCallback(async () => {
        if (!_identity) {
            return
        }

        if (typeof process.env.NEXT_PUBLIC_GROUP_ID !== "string") {
            throw new Error("Please, define NEXT_PUBLIC_GROUP_ID in your .env file")
        }

        const feedback = prompt("Please enter your feedback:")

        if (feedback && _users) {
            setLoading(true)

            setLogs(`Posting your anonymous feedback...`)

            try {
                const group = new Group(_users)

                const { points, merkleTreeDepth, merkleTreeRoot, nullifier, message } = await generateProof(
                    _identity,
                    group,
                    feedback,
                    process.env.NEXT_PUBLIC_GROUP_ID as string
                )

                let response: any

                if (process.env.OPENZEPPELIN_AUTOTASK_WEBHOOK) {
                    response = await fetch(process.env.OPENZEPPELIN_AUTOTASK_WEBHOOK, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            abi: Feedback.abi,
                            address: process.env.FEEDBACK_CONTRACT_ADDRESS,
                            functionName: "sendFeedback",
                            functionParameters: [merkleTreeDepth, merkleTreeRoot, nullifier, message, points]
                        })
                    })
                } else {
                    response = await fetch("api/feedback", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            feedback: message,
                            merkleTreeDepth,
                            merkleTreeRoot,
                            nullifier,
                            points
                        })
                    })
                }

                if (response.status === 200) {
                    addFeedback(feedback)

                    setLogs(`Your feedback has been posted 🎉`)
                } else {
                    setLogs("Some error occurred, please try again!")
                }
            } catch (error) {
                console.error(error)

                setLogs("Some error occurred, please try again!")
            } finally {
                setLoading(false)
            }
        }
    }, [_identity, _users, addFeedback, setLogs])

    return (
        <>
            <h2>Proofs</h2>

            <p>
                Semaphore members can anonymously{" "}
                <a
                    href="https://docs.semaphore.pse.dev/guides/proofs"
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                >
                    prove
                </a>{" "}
                that they are part of a group and send their anonymous messages. Messages could be votes, leaks,
                reviews, feedback, etc.
            </p>

            <div className="divider"></div>

            <div className="text-top">
                <h3>Feedback messages ({_feedback.length})</h3>
                <button className="button-link" onClick={refreshFeedback}>
                    Refresh
                </button>
            </div>

            <div>
                <button className="button" onClick={sendFeedback} disabled={_loading}>
                    <span>Send Feedback</span>
                    {_loading && <div className="loader"></div>}
                </button>
            </div>

            {_feedback.length > 0 && (
                <div>
                    {_feedback.map((f, i) => (
                        <div key={i}>
                            <p className="box box-text">{f}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="divider"></div>

            <Stepper step={3} onPrevClick={() => router.push("/groups")} />
        </>
    )
}
