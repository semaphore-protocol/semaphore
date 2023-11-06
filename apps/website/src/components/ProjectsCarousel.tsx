"use client"

import { Box, HStack, IconButton, Link, Stack, useBreakpointValue } from "@chakra-ui/react"
import NextLink from "next/link"
import { useCallback, useEffect, useState } from "react"
import allProjects from "../data/projects.json"
import IconArrowLeft from "../icons/IconArrowLeft"
import IconArrowRight from "../icons/IconArrowRight"
import { circularSlice } from "../utils/circularSlice"
import ProjectCard from "./ProjectCard"

export default function ProjectsCarousel() {
    const variant = useBreakpointValue(
        {
            base: 3,
            sm: 3,
            md: 2,
            lg: 3
        },
        {
            fallback: "md"
        }
    )

    const [projects, setProjects] = useState<typeof allProjects>()
    const [index, setIndex] = useState<number>(0)

    useEffect(() => {
        setProjects(circularSlice(allProjects, index, variant!))
    }, [index, variant])

    const nextProject = useCallback(() => {
        setIndex((i) => (i + 1) % allProjects.length)
    }, [index])

    const previousProject = useCallback(() => {
        setIndex((i) => (i === 0 ? allProjects.length - 1 : i - 1))
    }, [index])

    return (
        <>
            <Stack direction={{ base: "column", md: "row" }} spacing="8">
                {projects &&
                    projects.map((project) => (
                        <Link flex="1" key={project.name} href={project.links.github} isExternal>
                            <ProjectCard title={project.name} description={project.tagline} tags={project.tags} />
                        </Link>
                    ))}
            </Stack>
            <HStack display={{ base: "none", md: "block" }} w="100%">
                <Box flex="1" />

                <HStack flex="1" justify="center">
                    <IconButton
                        onClick={previousProject}
                        variant="link"
                        aria-label="Arrow left"
                        icon={<IconArrowLeft />}
                    />
                    <IconButton
                        onClick={nextProject}
                        variant="link"
                        aria-label="Arrow right"
                        icon={<IconArrowRight />}
                    />
                </HStack>

                <HStack flex="1" justify="right" fontSize="12px">
                    <Link
                        as={NextLink}
                        href="/projects"
                        textTransform="uppercase"
                        textDecoration="underline"
                        _hover={{
                            textDecoration: "underline"
                        }}
                    >
                        View more
                    </Link>
                </HStack>
            </HStack>
        </>
    )
}
