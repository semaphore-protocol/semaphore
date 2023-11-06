"use client"

import { useCallback, useEffect, useState } from "react"
import { Box, HStack, IconButton, Link } from "@chakra-ui/react"
import NextLink from "next/link"
import allProjects from "../data/projects.json"
import IconArrowLeft from "../icons/IconArrowLeft"
import IconArrowRight from "../icons/IconArrowRight"
import { circularSlice } from "../utils/circularSlice"
import ProjectCard from "./ProjectCard"

export default function ProjectsCarousel() {
    const [projects, setProjects] = useState<typeof allProjects>(allProjects.slice(0, 3))
    const [index, setIndex] = useState<number>(0)

    useEffect(() => {
        setProjects(circularSlice(projects, index, 3))
    }, [index])

    const nextProject = useCallback(() => {
        setIndex((i) => (i + 1) % projects.length)
    }, [index])

    const previousProject = useCallback(() => {
        setIndex((i) => (i === 0 ? projects.length - 1 : i - 1))
    }, [index])

    return (
        <>
            <HStack spacing="8">
                {projects.map((project) => (
                    <Link flex="1" key={project.name} href={project.links.github} target="_blank">
                        <ProjectCard title={project.name} description={project.tagline} tags={project.tags} />
                    </Link>
                ))}
            </HStack>
            <HStack w="100%">
                <Box flex="1" />

                <HStack flex="1" justify="center">
                    <IconButton onClick={nextProject} variant="link" aria-label="Arrow left" icon={<IconArrowLeft />} />
                    <IconButton
                        onClick={previousProject}
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
