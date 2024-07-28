"use client"

import { Box, Button, Divider, Heading, HStack, Link, Text } from "@chakra-ui/react"
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
            <Heading as="h2" size="xl">
                Identities
            </Heading>

            <Text pt="2" fontSize="md">
                The identity of a user in the Semaphore protocol. A{" "}
                <Link href="https://docs.semaphore.pse.dev/guides/identities" isExternal>
                    Semaphore identity
                </Link>{" "}
                consists of an{" "}
                <Link
                    href="https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/eddsa-poseidon"
                    isExternal
                >
                    EdDSA
                </Link>{" "}
                public/private key pair and a commitment, used as the public identifier of the identity.
            </Text>

            <Divider pt="5" borderColor="gray.500" />

            <HStack py="5">
                <Text fontWeight="bold" fontSize="lg">
                    Identity
                </Text>
            </HStack>

            {_identity && (
                <Box pb="6" pl="2">
                    <Text>
                        <b>Private Key (base64)</b>:<br /> {_identity.export()}
                    </Text>
                    <Text>
                        <b>Public Key</b>:<br /> [{_identity.publicKey[0].toString()},{" "}
                        {_identity.publicKey[1].toString()}]
                    </Text>
                    <Text>
                        <b>Commitment</b>:<br /> {_identity.commitment.toString()}
                    </Text>
                </Box>
            )}

            <Box pb="5">
                <Button w="full" colorScheme="primary" onClick={createIdentity}>
                    Create identity
                </Button>
            </Box>

            <Divider pt="3" borderColor="gray.500" />

            <Stepper step={1} onNextClick={_identity && (() => router.push("/group"))} />
        </>
    )
}
