import { Identity } from "@semaphore-protocol/identity"
import { useRouter } from "next/router"
import { useCallback, useContext, useEffect, useState } from "react"
import Stepper from "../components/Stepper"
import LogsContext from "../context/LogsContext"

export default function IdentitiesPage() {
    const router = useRouter()
    const { setLogs } = useContext(LogsContext)
    const [_identity, setIdentity] = useState<Identity>()

    useEffect(() => {
        const identityString = localStorage.getItem("identity")

        if (identityString) {
            const identity = new Identity(identityString)

            setIdentity(identity)

            setLogs("Your Semaphore identity was retrieved from the browser cache 👌🏽")
        } else {
            setLogs("Create your Semaphore identity 👆🏽")
        }
    }, [])

    const createIdentity = useCallback(async () => {
        const identity = new Identity()

        setIdentity(identity)

        localStorage.setItem("identity", identity.toString())

        setLogs("Your new Semaphore identity was just created 🎉")
    }, [])

    return (
        <>
            <h2 className="font-size: 3rem;">Identities</h2>

            <p>
                Users interact with the protocol using a Semaphore{" "}
                <a
                    href="https://semaphore.appliedzkp.org/docs/guides/identities"
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                >
                    identity
                </a>{" "}
                (similar to Ethereum accounts). It contains three values:
            </p>
            <ol>
                <li>Trapdoor: private, known only by user</li>
                <li>Nullifier: private, known only by user</li>
                <li>Commitment: public</li>
            </ol>

            <div className="divider"></div>

            <div className="text-top">
                <h3>Identity</h3>
                {_identity && (
                    <button className="button-link" onClick={createIdentity}>
                        New
                    </button>
                )}
            </div>

            {_identity ? (
                <div>
                    <div className="box">
                        <p className="box-text">Trapdoor: {_identity.trapdoor.toString()}</p>
                        <p className="box-text">Nullifier: {_identity.nullifier.toString()}</p>
                        <p className="box-text">Commitment: {_identity.commitment.toString()}</p>
                    </div>
                </div>
            ) : (
                <div>
                    <button className="button" onClick={createIdentity}>
                        Create identity
                    </button>
                </div>
            )}

            <div className="divider"></div>

            <Stepper step={1} onNextClick={_identity && (() => router.push("/groups"))} />
        </>
    )
}
