"use client"

import { useCallback, useEffect, useState } from "react"
import { Box, HStack, IconButton, Link } from "@chakra-ui/react"
import allProjects from "../data/projects.json"
import IconArrowLeft from "../icons/IconArrowLeft"
import IconArrowRight from "../icons/IconArrowRight"
import { circularSlice } from "../utils/circularSlice"
import ProjectCard from "./ProjectCard"

export default function ProjectsCarousel() {
    const [projects, setCarouselProjects] = useState<typeof allProjects>(allProjects.slice(0, 3))
    const [index, setCarouselIndex] = useState<number>(0)

    useEffect(() => {
        setCarouselProjects(circularSlice(projects, index, 3))
    }, [index])

    const nextProject = useCallback(() => {
        setCarouselIndex((i) => (i + 1) % projects.length)
    }, [index])

    const previousProject = useCallback(() => {
        setCarouselIndex((i) => (i === 0 ? projects.length - 1 : i - 1))
    }, [index])

    return (
        <>
            <HStack spacing="8">
                {projects.map((project) => (
                    <Link key={project.name} href={project.links.github} target="_blank">
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
