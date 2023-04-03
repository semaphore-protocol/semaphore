import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import { BigNumber, utils } from "ethers"
import getNextConfig from "next/config"
import { useRouter } from "next/router"
import { useCallback, useContext, useEffect, useState } from "react"
import Feedback from "../../contract-artifacts/Feedback.json"
import Stepper from "../components/Stepper"
import LogsContext from "../context/LogsContext"
import SemaphoreContext from "../context/SemaphoreContext"

const { publicRuntimeConfig: env } = getNextConfig()

export default function ProofsPage() {
    const router = useRouter()
    const { setLogs } = useContext(LogsContext)
    const { _users, _feedback, refreshFeedback, addFeedback } = useContext(SemaphoreContext)
    const [_loading, setLoading] = useState(false)
    const [_identity, setIdentity] = useState<Identity>()

    useEffect(() => {
        const identityString = localStorage.getItem("identity")

        if (!identityString) {
            router.push("/")
            return
        }

        setIdentity(new Identity(identityString))
    }, [])

    useEffect(() => {
        if (_feedback.length > 0) {
            setLogs(`${_feedback.length} feedback retrieved from the group 🤙🏽`)
        }
    }, [_feedback])

    const sendFeedback = useCallback(async () => {
        if (!_identity) {
            return
        }

        const feedback = prompt("Please enter your feedback:")

        if (feedback && _users) {
            setLoading(true)

            setLogs(`Posting your anonymous feedback...`)

            try {
                const group = new Group(env.GROUP_ID)

                const signal = BigNumber.from(utils.formatBytes32String(feedback)).toString()

                group.addMembers(_users)

                const { proof, merkleTreeRoot, nullifierHash } = await generateProof(
                    _identity,
                    group,
                    env.GROUP_ID,
                    signal
                )

                let response: any

                if (env.OPENZEPPELIN_AUTOTASK_WEBHOOK) {
                    response = await fetch(env.OPENZEPPELIN_AUTOTASK_WEBHOOK, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            abi: Feedback.abi,
                            address: env.FEEDBACK_CONTRACT_ADDRESS,
                            functionName: "sendFeedback",
                            functionParameters: [signal, merkleTreeRoot, nullifierHash, proof]
                        })
                    })
                } else {
                    response = await fetch("api/feedback", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            feedback: signal,
                            merkleTreeRoot,
                            nullifierHash,
                            proof
                        })
                    })
                }

                if (response.status === 200) {
                    addFeedback(feedback)

                    setLogs(`Your feedback was posted 🎉`)
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
    }, [_identity])

    return (
        <>
            <h2>Proofs</h2>

            <p>
                Semaphore members can anonymously{" "}
                <a
                    href="https://semaphore.appliedzkp.org/docs/guides/proofs"
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                >
                    prove
                </a>{" "}
                that they are part of a group and that they are generating their own signals. Signals could be anonymous
                votes, leaks, reviews, or feedback.
            </p>

            <div className="divider"></div>

            <div className="text-top">
                <h3>Feedback signals ({_feedback.length})</h3>
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
