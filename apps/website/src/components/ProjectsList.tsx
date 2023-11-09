"use client"

import { Button, Grid, GridItem, HStack, IconButton, Link, Text, VStack } from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"
import ProjectCard from "../components/ProjectCard"
import allProjects from "../data/projects.json"
import IconChevronLeft from "../icons/IconChevronLeft"
import IconChevronRight from "../icons/IconChevronRight"
import IconCommunity from "../icons/IconCommunity"
import IconPSE from "../icons/IconPSE"
import { chunkArray } from "../utils/chunkArray"
import { getProjectCategories } from "../utils/getProjectCategories"

export default function ProjectsList(props: any) {
    const [projects, setProjects] = useState<(typeof allProjects)[]>(chunkArray(allProjects))
    const [index, setIndex] = useState<number>(0)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [onlyPSE, setOnlyPSE] = useState<boolean | null>(null)

    const filterProjects = useCallback(() => {
        let filteredProjects = allProjects

        if (selectedCategory) {
            filteredProjects = filteredProjects.filter((project) => project.categories.includes(selectedCategory))
        }

        if (onlyPSE === true) {
            filteredProjects = filteredProjects.filter((project) => project.pse)
        } else if (onlyPSE === false) {
            filteredProjects = filteredProjects.filter((project) => !project.pse)
        }

        setProjects(chunkArray(filteredProjects))
    }, [selectedCategory, onlyPSE])

    useEffect(() => {
        filterProjects()
    }, [selectedCategory, onlyPSE])

    return (
        <VStack {...props}>
            <VStack align="left" spacing="6">
                <Text fontSize="20">Projects created by</Text>

                <HStack spacing="4" flexWrap="wrap">
                    <Button
                        size="lg"
                        leftIcon={<IconPSE />}
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
                    {getProjectCategories(allProjects).map((category) => (
                        <Button
                            key={category}
                            size="sm"
                            variant={category === selectedCategory ? "solid" : "outline"}
                            colorScheme={category === selectedCategory ? "primary" : "inherit"}
                            onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                        >
                            {category}
                        </Button>
                    ))}
                </HStack>
            </VStack>

            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)", "2xl": "repeat(3, 1fr)" }} gap={6}>
                {projects[index].map((project, i) => (
                    <GridItem key={project.name + i}>
                        <Link href={project.links.website || project.links.github} target="_blank">
                            <ProjectCard
                                title={project.name}
                                description={project.tagline}
                                categories={project.categories}
                            />
                        </Link>
                    </GridItem>
                ))}
            </Grid>

            {projects.length > 1 && (
                <HStack w="100%">
                    <HStack flex="1" justify="center">
                        <IconButton
                            visibility={index > 0 ? "visible" : "hidden"}
                            onClick={() => setIndex((i) => i - 1)}
                            variant="link"
                            aria-label="Arrow left"
                            icon={<IconChevronLeft />}
                        />

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

                        <IconButton
                            visibility={index < projects.length - 1 ? "visible" : "hidden"}
                            onClick={() => setIndex((i) => i + 1)}
                            variant="link"
                            aria-label="Arrow right"
                            icon={<IconChevronRight />}
                        />
                    </HStack>
                </HStack>
            )}
        </VStack>
    )
}
