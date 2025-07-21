import { useEffect, useState } from "react"
import { Identity } from "@semaphore-protocol/core"
import { useRouter } from "next/navigation"

export default function useSemaphoreIdentity() {
    const router = useRouter()
    const [_identity, setIdentity] = useState<Identity>()

    useEffect(() => {
        const privateKey = localStorage.getItem("identity")

        if (!privateKey) {
            router.push("/")
            return
        }

        setIdentity(new Identity(privateKey))
    }, [router])

    return {
        _identity
    }
}
