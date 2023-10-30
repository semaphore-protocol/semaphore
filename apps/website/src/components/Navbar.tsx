"use client"

import { Heading, HStack, Link } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import IconArrowUpRight from "../icons/IconArrowUpRight"

export default function Navbar() {
    const pathname = usePathname()

    return (
        <HStack py="7" justify="space-between">
            <Image width="148" height="40" src="./semaphore-logo.svg" alt="Semaphore logo" />
            <HStack fontSize="18px" spacing="10">
                <Link
                    as={NextLink}
                    href="/projects"
                    variant="navlink"
                    borderBottomColor={pathname === "/projects" ? "ceruleanBlue" : "transparent"}
                >
                    <Heading fontSize="18px" fontWeight="normal">
                        Projects
                    </Heading>
                </Link>
                <Link
                    as={NextLink}
                    href="/learn"
                    variant="navlink"
                    borderBottomColor={pathname === "/learn" ? "ceruleanBlue" : "transparent"}
                >
                    <Heading fontSize="18px" fontWeight="normal">
                        Learn
                    </Heading>
                </Link>
                <Link
                    as={NextLink}
                    href="/build"
                    variant="navlink"
                    borderBottomColor={pathname === "/build" ? "ceruleanBlue" : "transparent"}
                >
                    <Heading fontSize="18px" fontWeight="normal">
                        Build
                    </Heading>
                </Link>
                <Link href="https://docs.semaphore.pse.dev" variant="navlink" isExternal>
                    <HStack spacing="3">
                        <Heading fontSize="18px" fontWeight="normal">
                            Documentation
                        </Heading>
                        <IconArrowUpRight width="10px" mb={1} />
                    </HStack>
                </Link>
                <Link href="https://github.com/semaphore-protocol" variant="navlink" isExternal>
                    <HStack spacing="3">
                        <Heading fontSize="18px" fontWeight="normal">
                            Github
                        </Heading>
                        <IconArrowUpRight width="10px" mb={1} />
                    </HStack>
                </Link>
            </HStack>
        </HStack>
    )
}
