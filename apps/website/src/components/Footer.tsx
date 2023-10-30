import { Divider, Heading, HStack, Image, Link, Text, VStack } from "@chakra-ui/react"
import NextLink from "next/link"
import IconArrowUpRight from "../icons/IconArrowUpRight"
import IconDiscord from "../icons/IconDiscord"

export default function Footer() {
    return (
        <VStack py="7" justify="space-between" h="611px" pt="28" pb="10">
            <Image htmlWidth="79px" src="./semaphore-icon.svg" alt="Semaphore logo" />
            <HStack fontSize="18px" spacing="10">
                <Link as={NextLink} href="/projects">
                    <Heading fontSize="18px" fontWeight="normal">
                        Projects
                    </Heading>
                </Link>
                <Link as={NextLink} href="/learn">
                    <Heading fontSize="18px" fontWeight="normal">
                        Learn
                    </Heading>
                </Link>
                <Link as={NextLink} href="/build">
                    <Heading fontSize="18px" fontWeight="normal">
                        Build
                    </Heading>
                </Link>
                <Link as={NextLink} href="https://docs.semaphore.pse.dev" isExternal>
                    <HStack spacing="3">
                        <Heading fontSize="18px" fontWeight="normal">
                            Documentation
                        </Heading>
                        <IconArrowUpRight width="10px" mb={1} />
                    </HStack>
                </Link>
                <Link as={NextLink} href="https://github.com/semaphore-protocol" isExternal>
                    <HStack spacing="3">
                        <Heading fontSize="18px" fontWeight="normal">
                            Github
                        </Heading>
                        <IconArrowUpRight width="10px" mb={1} />
                    </HStack>
                </Link>
                <Link as={NextLink} href="" isExternal>
                    <HStack spacing="3">
                        <Heading fontSize="18px" fontWeight="normal">
                            Design Kit
                        </Heading>
                        <IconArrowUpRight width="10px" mb={1} />
                    </HStack>
                </Link>
            </HStack>

            <Divider />

            <Link as={NextLink} href="https://semaphore.pse.dev/discord" isExternal>
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
