"use client"

import { HStack, Image, Link } from "@chakra-ui/react"
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
                    Projects
                </Link>
                <Link
                    href="/learn"
                    variant="navlink"
                    borderBottomColor={pathname === "/learn" ? "ceruleanBlue" : "transparent"}
                >
                    Learn
                </Link>
                <Link
                    href="/build"
                    variant="navlink"
                    borderBottomColor={pathname === "/build" ? "ceruleanBlue" : "transparent"}
                >
                    Build
                </Link>
                <Link href="https://docs.semaphore.pse.dev" isExternal>
                    Documentation
                    <IconArrowUpRight width="10px" ml={3} mb={1} />
                </Link>
                <Link href="https://github.com/semaphore-protocol" isExternal>
                    Github
                    <IconArrowUpRight width="10px" ml={3} mb={1} />
                </Link>
            </HStack>
        </HStack>
    )
}
