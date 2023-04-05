import { Identity } from "@semaphore-protocol/identity"
import getNextConfig from "next/config"
import { useRouter } from "next/router"
import { useCallback, useContext, useEffect, useState } from "react"
import Feedback from "../../contract-artifacts/Feedback.json"
import Stepper from "../components/Stepper"
import LogsContext from "../context/LogsContext"
import SemaphoreContext from "../context/SemaphoreContext"

const { publicRuntimeConfig: env } = getNextConfig()

export default function GroupsPage() {
    const router = useRouter()
    const { setLogs } = useContext(LogsContext)
    const { _users, refreshUsers, addUser } = useContext(SemaphoreContext)
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
        if (_users.length > 0) {
            setLogs(`${_users.length} user${_users.length > 1 ? "s" : ""} retrieved from the group 🤙🏽`)
        }
    }, [_users])

    const joinGroup = useCallback(async () => {
        if (!_identity) {
            return
        }

        setLoading(true)
        setLogs(`Joining the Feedback group...`)

        let response: any

        if (env.OPENZEPPELIN_AUTOTASK_WEBHOOK) {
            response = await fetch(env.OPENZEPPELIN_AUTOTASK_WEBHOOK, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    abi: Feedback.abi,
                    address: env.FEEDBACK_CONTRACT_ADDRESS,
                    functionName: "joinGroup",
                    functionParameters: [_identity.commitment.toString()]
                })
            })
        } else {
            response = await fetch("api/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identityCommitment: _identity.commitment.toString()
                })
            })
        }

        if (response.status === 200) {
            addUser(_identity.commitment.toString())

            setLogs(`You joined the Feedback group event 🎉 Share your feedback anonymously!`)
        } else {
            setLogs("Some error occurred, please try again!")
        }

        setLoading(false)
    }, [_identity])

    const userHasJoined = useCallback((identity: Identity) => _users.includes(identity.commitment.toString()), [_users])

    return (
        <>
            <h2>Groups</h2>

            <p>
                Semaphore{" "}
                <a
                    href="https://semaphore.appliedzkp.org/docs/guides/groups"
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                >
                    groups
                </a>{" "}
                are binary incremental Merkle trees in which each leaf contains an identity commitment for a user.
                Groups can be abstracted to represent events, polls, or organizations.
            </p>

            <div className="divider"></div>

            <div className="text-top">
                <h3>Feedback users ({_users.length})</h3>
                <button className="button-link" onClick={refreshUsers}>
                    Refresh
                </button>
            </div>

            <div>
                <button
                    className="button"
                    onClick={joinGroup}
                    disabled={_loading || !_identity || userHasJoined(_identity)}
                >
                    <span>Join group</span>
                    {_loading && <div className="loader"></div>}
                </button>
            </div>

            {_users.length > 0 && (
                <div>
                    {_users.map((user, i) => (
                        <div key={i}>
                            <p className="box box-text">{user}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="divider"></div>

            <Stepper
                step={2}
                onPrevClick={() => router.push("/")}
                onNextClick={_identity && userHasJoined(_identity) ? () => router.push("/proofs") : undefined}
            />
        </>
    )
}
