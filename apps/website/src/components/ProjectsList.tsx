"use client"

import { Button, Grid, GridItem, HStack, IconButton, Link, Text, VStack } from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"
import ProjectCard from "../components/ProjectCard"
import allProjects from "../data/projects.json"
import IconChevronLeft from "../icons/IconChevronLeft"
import IconChevronRight from "../icons/IconChevronRight"
import IconCommunity from "../icons/IconCommunity"
import { chunkArray } from "../utils/chunkArray"
import { getProjectTags } from "../utils/getProjectTags"

export default function ProjectsList(props: any) {
    const [projects, setProjects] = useState<(typeof allProjects)[]>(chunkArray(allProjects))
    const [index, setIndex] = useState<number>(0)
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const [onlyPSE, setOnlyPSE] = useState<boolean | null>(null)

    const filterProjects = useCallback(() => {
        let filteredProjects = allProjects

        if (selectedTag) {
            filteredProjects = filteredProjects.filter((project) => project.tags.includes(selectedTag))
        }

        if (onlyPSE === true) {
            filteredProjects = filteredProjects.filter((project) => project.pse)
        } else if (onlyPSE === false) {
            filteredProjects = filteredProjects.filter((project) => !project.pse)
        }

        setProjects(chunkArray(filteredProjects))
    }, [selectedTag, onlyPSE])

    useEffect(() => {
        filterProjects()
    }, [selectedTag, onlyPSE])

    return (
        <VStack {...props}>
            <VStack align="left" spacing="6">
                <Text fontSize="20">Projects created by</Text>

                <HStack spacing="4" flexWrap="wrap">
                    <Button
                        size="lg"
                        variant={onlyPSE === true ? "solid" : "outline"}
                        colorScheme={onlyPSE === true ? "primary" : "inherit"}
                        onClick={() => setOnlyPSE(onlyPSE === true ? null : true)}
                    >
                        PSE
                    </Button>
                    <Button
                        size="lg"
                        leftIcon={<IconCommunity />}
                        variant={onlyPSE === false ? "solid" : "outline"}
                        colorScheme={onlyPSE === false ? "primary" : "inherit"}
                        onClick={() => setOnlyPSE(onlyPSE === false ? null : false)}
                    >
                        Community
                    </Button>
                </HStack>
            </VStack>

            <VStack align="left" spacing="6">
                <Text fontSize="20">Category</Text>

                <HStack spacing="3" flexWrap="wrap">
                    {getProjectTags(allProjects).map((tag) => (
                        <Button
                            key={tag}
                            size="sm"
                            variant={tag === selectedTag ? "solid" : "outline"}
                            colorScheme={tag === selectedTag ? "primary" : "inherit"}
                            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                        >
                            {tag}
                        </Button>
                    ))}
                </HStack>
            </VStack>

            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)", "2xl": "repeat(3, 1fr)" }} gap={6}>
                {projects[index].map((project, i) => (
                    <GridItem key={project.name + i}>
                        <Link href={project.links.github} target="_blank">
                            <ProjectCard title={project.name} description={project.tagline} tags={project.tags} />
                        </Link>
                    </GridItem>
                ))}
            </Grid>

            {projects.length > 1 && (
                <HStack w="100%">
                    <HStack flex="1" justify="center">
                        {index > 0 && <IconButton variant="link" aria-label="Arrow left" icon={<IconChevronLeft />} />}

                        <HStack spacing="5">
                            {projects.map((_, i) => (
                                <Text
                                    key={i}
                                    onClick={() => setIndex(i)}
                                    cursor="pointer"
                                    color={i === index ? "primary.600" : "text.400"}
                                >
                                    {i + 1}
                                </Text>
                            ))}
                        </HStack>

                        {index < projects.length - 1 && (
                            <IconButton variant="link" aria-label="Arrow right" icon={<IconChevronRight />} />
                        )}
                    </HStack>
                </HStack>
            )}
        </VStack>
    )
}
