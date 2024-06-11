"use client"

import {
    Box,
    Container,
    Divider,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerOverlay,
    HStack,
    Heading,
    IconButton,
    Link,
    Text,
    VStack,
    useDisclosure
} from "@chakra-ui/react"
import Image from "next/image"
import NextLink from "next/link"
import IconDiscord from "../icons/IconDiscord"
import IconMenu from "../icons/IconMenu"
import IconThumbsUp from "../icons/IconThumbsUp"
import NavbarLinks from "./NavbarLinks"
import IconX from "@/icons/IconX"

export default function Navbar() {
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <HStack zIndex="1" py="7" top="42px" left="0" right="0" position="fixed" bgColor="darkBlueBg">
            <Container maxW="1440px" px={{ base: "5", md: "10" }}>
                <HStack justify="space-between">
                    <Link as={NextLink} href="/">
                        <Box display={{ base: "none", sm: "block" }}>
                            <Image width="148" height="40" src="./semaphore-logo.svg" alt="Semaphore logo" />
                        </Box>
                        <Box display={{ base: "block", sm: "none" }}>
                            <Image width="20" height="40" src="./semaphore-icon.svg" alt="Semaphore icon" />
                        </Box>
                    </Link>

                    <HStack display={{ base: "none", md: "flex" }} fontSize="18px" spacing="10">
                        <NavbarLinks />
                    </HStack>

                    <IconButton
                        px="0 !important"
                        onClick={onOpen}
                        display={{ base: "block", md: "none" }}
                        aria-label="Menu"
                        variant="unstyled"
                        icon={<IconMenu boxSize="6" />}
                    />

                    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
                        <DrawerOverlay />
                        <DrawerContent bgColor="darkBlueBg">
                            <DrawerCloseButton mt="25px" mr="21px" />

                            <DrawerBody>
                                <VStack spacing="8" mt="20">
                                    <NavbarLinks onClick={onClose} />
                                </VStack>
                            </DrawerBody>

                            <DrawerFooter mb="5" flexDirection="column">
                                <Divider mb="20" />

                                <VStack w="full" justify="center" spacing="5">
                                    <HStack spacing="5">
                                        <Link href="https://semaphore.pse.dev/discord" isExternal>
                                            <HStack>
                                                <IconDiscord boxSize={{ base: "16px", md: "24px" }} />
                                                <Heading fontSize={{ base: "14px", md: "18px" }} fontWeight="normal">
                                                    Discord
                                                </Heading>
                                            </HStack>
                                        </Link>
                                        <Link href="https://x.com/SemaphoreDevs" isExternal>
                                            <HStack>
                                                <IconX boxSize={{ base: "16px", md: "24px" }} />
                                                <Heading fontSize={{ base: "14px", md: "18px" }} fontWeight="normal">
                                                    X (Twitter)
                                                </Heading>
                                            </HStack>
                                        </Link>
                                    </HStack>

                                    <VStack spacing="8">
                                        <Link
                                            href="https://github.com/orgs/semaphore-protocol/discussions/new?category=website"
                                            isExternal
                                        >
                                            <HStack>
                                                <IconThumbsUp boxSize={{ base: "16px", md: "24px" }} />
                                                <Heading fontSize={{ base: "14px", md: "18px" }} fontWeight="normal">
                                                    Give feedback about the website
                                                </Heading>
                                            </HStack>
                                        </Link>

                                        <Text fontSize={{ base: "12px", md: "14px" }} color="text.500" pt="2">
                                            Copyright © 2024 Ethereum Foundation
                                        </Text>
                                    </VStack>
                                </VStack>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                </HStack>
            </Container>
        </HStack>
    )
}
