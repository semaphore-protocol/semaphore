import { Divider, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react"
import Image from "next/image"
import IconArrowUpRight from "../icons/IconArrowUpRight"
import IconDiscord from "../icons/IconDiscord"

export default function Footer() {
    return (
        <VStack py="7" justify="space-between" h="611px" pt="28" pb="10">
            <Image width="79" height="158" src="./semaphore-icon.svg" alt="Semaphore logo" />
            <HStack fontSize="18px" spacing="10">
                <Link href="/projects">
                    <Heading fontSize="18px" fontWeight="normal">
                        Projects
                    </Heading>
                </Link>
                <Link href="/learn">
                    <Heading fontSize="18px" fontWeight="normal">
                        Learn
                    </Heading>
                </Link>
                <Link href="/build">
                    <Heading fontSize="18px" fontWeight="normal">
                        Build
                    </Heading>
                </Link>
                <Link href="https://docs.semaphore.pse.dev" isExternal>
                    <HStack spacing="3">
                        <Heading fontSize="18px" fontWeight="normal">
                            Documentation
                        </Heading>
                        <IconArrowUpRight width="10px" mb={1} />
                    </HStack>
                </Link>
                <Link href="https://github.com/semaphore-protocol" isExternal>
                    <HStack spacing="3">
                        <Heading fontSize="18px" fontWeight="normal">
                            Github
                        </Heading>
                        <IconArrowUpRight width="10px" mb={1} />
                    </HStack>
                </Link>
                <Link href="" isExternal>
                    <HStack spacing="3">
                        <Heading fontSize="18px" fontWeight="normal">
                            Design Kit
                        </Heading>
                        <IconArrowUpRight width="10px" mb={1} />
                    </HStack>
                </Link>
            </HStack>

            <Divider />

            <Link href="https://semaphore.pse.dev/discord" isExternal>
                <HStack>
                    <IconDiscord width="24px" />
                    <Heading fontSize="18px" fontWeight="normal">
                        Discord
                    </Heading>
                </HStack>
            </Link>

            <Text fontSize="14px" color="text.500">
                Copyright © 2023 Ethereum Foundation
            </Text>
        </VStack>
    )
}
