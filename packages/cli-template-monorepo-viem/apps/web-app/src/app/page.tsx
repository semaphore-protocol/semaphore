"use client"

import { Identity } from "@semaphore-protocol/core"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import Stepper from "../components/Stepper"
import { useLogContext } from "../context/LogContext"

export default function IdentitiesPage() {
    const router = useRouter()
    const { setLog } = useLogContext()
    const [_identity, setIdentity] = useState<Identity>()

    useEffect(() => {
        const privateKey = localStorage.getItem("identity")

        if (privateKey) {
            const identity = Identity.import(privateKey)

            setIdentity(identity)

            setLog("Your Semaphore identity has been retrieved from the browser cache 👌🏽")
        } else {
            setLog("Create your Semaphore identity 👆🏽")
        }
    }, [setLog])

    const createIdentity = useCallback(async () => {
        const identity = new Identity()

        setIdentity(identity)

        localStorage.setItem("identity", identity.export())

        setLog("Your new Semaphore identity has just been created 🎉")
    }, [setLog])

    return (
        <>
            <h2>Identities</h2>

            <p>
                The identity of a user in the Semaphore protocol. A{" "}
                <a
                    href="https://docs.semaphore.pse.dev/guides/identities"
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                >
                    Semaphore identity
                </a>{" "}
                consists of an{" "}
                <a
                    href="https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/eddsa-poseidon"
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                >
                    EdDSA
                </a>{" "}
                public/private key pair and a commitment, used as the public identifier of the identity.
            </p>

            <div className="divider" />

            <div className="keys-header">
                <h3>Identity</h3>
            </div>

            {_identity && (
                <div className="key-wrapper">
                    <p>
                        <b>Private Key (base64)</b>:<br /> {_identity.export()}
                    </p>
                    <p>
                        <b>Public Key</b>:<br /> [{_identity.publicKey[0].toString()},{" "}
                        {_identity.publicKey[1].toString()}]
                    </p>
                    <p>
                        <b>Commitment</b>:<br /> {_identity.commitment.toString()}
                    </p>
                </div>
            )}

            <div>
                <button className="button" onClick={createIdentity} type="button">
                    Create identity
                </button>
            </div>

            <div className="divider" />

            <Stepper step={1} onNextClick={_identity && (() => router.push("/group"))} />
        </>
    )
}
