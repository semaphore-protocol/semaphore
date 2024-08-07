"use client"

import Stepper from "@/components/Stepper"
import { useLogContext } from "@/context/LogContext"
import { useSemaphoreContext } from "@/context/SemaphoreContext"
import IconRefreshLine from "@/icons/IconRefreshLine"
import { Box, Button, Divider, Heading, HStack, Link, Text, useBoolean, VStack } from "@chakra-ui/react"
import { generateProof, Group } from "@semaphore-protocol/core"
import { encodeBytes32String, ethers } from "ethers"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo } from "react"
import Feedback from "../../../contract-artifacts/Feedback.json"
import useSemaphoreIdentity from "@/hooks/useSemaphoreIdentity"

export default function ProofsPage() {
    const router = useRouter()
    const { setLog } = useLogContext()
    const { _users, _feedback, refreshFeedback, addFeedback } = useSemaphoreContext()
    const [_loading, setLoading] = useBoolean()
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
            setLoading.on()

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
                setLoading.off()
            }
        }
    }, [_identity, _users, addFeedback, setLoading, setLog])

    return (
        <>
            <Heading as="h2" size="xl">
                Proofs
            </Heading>

            <Text pt="2" fontSize="md">
                Semaphore members can anonymously{" "}
                <Link href="https://docs.semaphore.pse.dev/guides/proofs" isExternal>
                    prove
                </Link>{" "}
                that they are part of a group and send their anonymous messages. Messages could be votes, leaks,
                reviews, or feedback.
            </Text>

            <Divider pt="5" borderColor="gray.500" />

            <HStack py="5" justify="space-between">
                <Text fontWeight="bold" fontSize="lg">
                    Feedback ({_feedback.length})
                </Text>
                <Button
                    leftIcon={<IconRefreshLine />}
                    variant="link"
                    color="text.300"
                    onClick={refreshFeedback}
                    size="lg"
                >
                    Refresh
                </Button>
            </HStack>

            {_feedback.length > 0 && (
                <VStack spacing="3" pb="3" align="left" maxHeight="300px" overflowY="scroll">
                    {feedback.map((f, i) => (
                        <HStack key={i} pb="3" borderBottomWidth={i < _feedback.length - 1 ? 1 : 0}>
                            <Text>{f}</Text>
                        </HStack>
                    ))}
                </VStack>
            )}

            <Box pb="5">
                <Button w="full" colorScheme="primary" isDisabled={_loading} onClick={sendFeedback}>
                    Send feedback
                </Button>
            </Box>

            <Divider pt="3" borderColor="gray" />

            <Stepper step={3} onPrevClick={() => router.push("/group")} />
        </>
    )
}
