"use client"

import { Box, HStack, IconButton, Link, VStack, useBreakpointValue } from "@chakra-ui/react"
import NextLink from "next/link"
import { useCallback, useState } from "react"
import projects from "../data/projects.json"
import IconArrowLeft from "../icons/IconArrowLeft"
import IconArrowRight from "../icons/IconArrowRight"
import ProjectCard from "./ProjectCard"

export default function ProjectsCarousel() {
    const [index, setIndex] = useState<number>(0)
    const numberOfItems = useBreakpointValue({
        md: 2,
        lg: 3
    })

    const nextProject = useCallback(() => {
        if (index + 1 === Math.ceil(projects.length / numberOfItems!)) {
            setIndex(0)
        } else {
            setIndex((prevIndex) => prevIndex + 1)
        }
    }, [index, numberOfItems])

    const previousProject = useCallback(() => {
        if (index === 0) {
            setIndex(Math.ceil(projects.length / numberOfItems!) - 1)
        } else {
            setIndex((prevIndex) => prevIndex - 1)
        }
    }, [index])

    return (
        <>
            <HStack display={{ base: "none", md: "flex" }} w="full" overflow="hidden">
                <HStack
                    w="full"
                    transition="transform 0.4s ease-in-out"
                    transform={`translateX(-${index * 100}%)`}
                    py="1"
                    spacing="0"
                >
                    {projects.map((project) => (
                        <Link
                            minW={{ md: `${100 / 2}%`, lg: `${100 / 3}%` }}
                            key={project.name}
                            href={project.links.github}
                            isExternal
                        >
                            <Box px="3">
                                <ProjectCard title={project.name} description={project.tagline} tags={project.tags} />
                            </Box>
                        </Link>
                    ))}
                </HStack>
            </HStack>

            <VStack display={{ base: "flex", md: "none" }} spacing="3">
                {projects.slice(0, 3).map((project) => (
                    <Link w="full" key={project.name} href={project.links.github} isExternal>
                        <ProjectCard title={project.name} description={project.tagline} tags={project.tags} />
                    </Link>
                ))}
            </VStack>

            <HStack display={{ base: "none", md: "flex" }} w="100%">
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
