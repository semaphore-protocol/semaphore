"use client"

import { Heading, HStack, Image, Link } from "@chakra-ui/react"
import { usePathname } from "next/navigation"
import IconArrowUpRight from "../icons/IconArrowUpRight"

export default function Navbar() {
    const pathname = usePathname()

    return (
        <HStack py="7" justify="space-between">
            <Image htmlWidth="148px" src="./semaphore-logo.svg" alt="Semaphore logo" />
            <HStack fontSize="18px" spacing="10">
                <Link
                    href="/projects"
                    variant="navlink"
                    borderBottomColor={pathname === "/projects" ? "ceruleanBlue" : "transparent"}
                >
                    <Heading fontSize="18px" fontWeight="normal">
                        Projects
                    </Heading>
                </Link>
                <Link
                    href="/learn"
                    variant="navlink"
                    borderBottomColor={pathname === "/learn" ? "ceruleanBlue" : "transparent"}
                >
                    <Heading fontSize="18px" fontWeight="normal">
                        Learn
                    </Heading>
                </Link>
                <Link
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
