"use client"

import Stepper from "@/components/Stepper"
import { useLogContext } from "@/context/LogContext"
import { useSemaphoreContext } from "@/context/SemaphoreContext"
import { generateProof, Group } from "@semaphore-protocol/core"
import { encodeBytes32String, ethers } from "ethers"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import Feedback from "../../../contract-artifacts/Feedback.json"
import useSemaphoreIdentity from "@/hooks/useSemaphoreIdentity"

export default function ProofsPage() {
    const router = useRouter()
    const { setLog } = useLogContext()
    const { _users, _feedback, refreshFeedback, addFeedback } = useSemaphoreContext()
    const [_loading, setLoading] = useState(false)
    const { _identity } = useSemaphoreIdentity()

    useEffect(() => {
        if (_feedback.length > 0) {
            setLog(`${_feedback.length} feedback retrieved from the group 🤙🏽`)
        }
    }, [_feedback, setLog])

    const feedback = useMemo(() => [..._feedback].reverse(), [_feedback])

    const sendFeedback = useCallback(async () => {
        if (!_identity) {
            return
        }

        const feedback = prompt("Please enter your feedback:")

        if (feedback && _users) {
            setLoading(true)

            setLog(`Posting your anonymous feedback...`)

            try {
                const group = new Group(_users)

                const message = encodeBytes32String(feedback)

                const { points, merkleTreeDepth, merkleTreeRoot, nullifier } = await generateProof(
                    _identity,
                    group,
                    message,
                    process.env.NEXT_PUBLIC_GROUP_ID as string
                )

                let feedbackSent: boolean = false
                const params = [merkleTreeDepth, merkleTreeRoot, nullifier, message, points]
                if (process.env.NEXT_PUBLIC_OPENZEPPELIN_AUTOTASK_WEBHOOK) {
                    const response = await fetch(process.env.NEXT_PUBLIC_OPENZEPPELIN_AUTOTASK_WEBHOOK, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            abi: Feedback.abi,
                            address: process.env.NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS,
                            functionName: "sendFeedback",
                            functionParameters: params
                        })
                    })

                    if (response.status === 200) {
                        feedbackSent = true
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
                        data: iface.encodeFunctionData("sendFeedback", params),
                        sponsorApiKey: process.env.GELATO_RELAYER_API_KEY
                    }
                    const response = await fetch(process.env.NEXT_PUBLIC_GELATO_RELAYER_ENDPOINT, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(request)
                    })

                    if (response.status === 201) {
                        feedbackSent = true
                    }
                } else {
                    const response = await fetch("api/feedback", {
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

                    if (response.status === 200) {
                        feedbackSent = true
                    }
                }

                if (feedbackSent) {
                    addFeedback(feedback)

                    setLog(`Your feedback has been posted 🎉`)
                } else {
                    setLog("Some error occurred, please try again!")
                }
            } catch (error) {
                console.error(error)

                setLog("Some error occurred, please try again!")
            } finally {
                setLoading(false)
            }
        }
    }, [_identity, _users, addFeedback, setLoading, setLog])

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
                <h3>Feedback ({_feedback.length})</h3>
                <button className="refresh-button" onClick={refreshFeedback}>
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

            {feedback.length > 0 && (
                <div className="feedback-wrapper">
                    {feedback.map((f, i) => (
                        <div key={i}>
                            <p className="box box-text">{f}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="send-feedback-button">
                <button className="button" onClick={sendFeedback} disabled={_loading}>
                    <span>Send Feedback</span>
                    {_loading && <div className="loader"></div>}
                </button>
            </div>

            <div className="divider"></div>

            <Stepper step={3} onPrevClick={() => router.push("/group")} />
        </>
    )
}
