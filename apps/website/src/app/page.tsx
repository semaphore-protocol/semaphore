"use client"

import { Box, Button, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react"

export default function Home() {
    return (
        <>
            <Box
                zIndex="-1"
                left="0"
                w="100%"
                h="724"
                pos="absolute"
                bgImg="url('./section-1.png')"
                bgSize="100%"
                bgPos="center"
                bgRepeat="no-repeat"
            />
            <VStack h="724" justify="center" spacing="40">
                <VStack>
                    <Heading fontSize="72px" textAlign="center">
                        Anonymous interactions
                    </Heading>
                    <Text fontSize="20px" align="center">
                        Using zero knowledge, users can prove their group membership and send <br /> signals such as
                        votes or endorsements without revealing their original identity.
                    </Text>
                </VStack>

                <HStack spacing="8">
                    <Link href="https://demo.semaphore.pse.dev" target="_blank">
                        <Button size="lg">Try the Demo</Button>
                    </Link>
                    <Link
                        href="https://github.com/semaphore-protocol/semaphore/tree/main/packages/cli#--------semaphore-cli----"
                        target="_blank"
                    >
                        <Button size="lg" variant="outline">
                            Build with CLI
                        </Button>
                    </Link>
                    <Link href="https://github.com/semaphore-protocol/boilerplate" target="_blank">
                        <Button size="lg" variant="outline">
                            Build with Boilerplate
                        </Button>
                    </Link>
                </HStack>
            </VStack>
        </>
    )
}
