"use client"

import { Grid, GridItem, HStack, IconButton, Tag, TagLabel, TagLeftIcon, Text, VStack } from "@chakra-ui/react"
import { useCallback, useEffect, useRef, useState } from "react"
import ProjectCard from "../components/ProjectCard"
import allProjects from "../data/projects.json"
import IconChevronLeft from "../icons/IconChevronLeft"
import IconChevronRight from "../icons/IconChevronRight"
import IconCommunity from "../icons/IconCommunity"
import IconPSE from "../icons/IconPSE"
import { chunkArray } from "../utils/chunkArray"
import { getProjectCategories } from "../utils/getProjectCategories"

const sortedProjects = allProjects.slice().sort((a, b) => a.name.localeCompare(b.name))

export default function ProjectsList(props: any) {
    const [projects, setProjects] = useState<(typeof allProjects)[]>(chunkArray(sortedProjects))
    const [index, setIndex] = useState<number>(0)
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [onlyPSE, setOnlyPSE] = useState<boolean | null>(null)
    const viewToScrollRef = useRef<HTMLDivElement>(null)

    const filterProjects = useCallback(() => {
        let filteredProjects = sortedProjects

        if (selectedCategories.length > 0) {
            filteredProjects = filteredProjects.filter((project) =>
                selectedCategories.every((category) => project.categories.includes(category))
            )
        }

        if (onlyPSE === true) {
            filteredProjects = filteredProjects.filter((project) => project.pse)
        } else if (onlyPSE === false) {
            filteredProjects = filteredProjects.filter((project) => !project.pse)
        }

        setProjects(chunkArray(filteredProjects))
    }, [selectedCategories, onlyPSE])

    const changePageIndex = useCallback((newIndex: number) => {
        setIndex(newIndex)

        if (viewToScrollRef.current) {
            viewToScrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [])

    useEffect(() => {
        filterProjects()
    }, [selectedCategories, onlyPSE])

    return (
        <VStack {...props}>
            <VStack align="start" spacing="6">
                <Text fontSize="20">Projects created by</Text>

                <HStack spacing="4" flexWrap="wrap">
                    <Tag
                        size="lg"
                        variant={onlyPSE === true ? "solid" : "outline"}
                        colorScheme={onlyPSE === true ? "primary" : "white"}
                        onClick={() => setOnlyPSE(onlyPSE === true ? null : true)}
                        cursor="pointer"
                        px="18px"
                        py="13px"
                    >
                        <TagLeftIcon boxSize="18px" as={IconPSE} />
                        <TagLabel>PSE</TagLabel>
                    </Tag>
                    <Tag
                        size="lg"
                        variant={onlyPSE === false ? "solid" : "outline"}
                        colorScheme={onlyPSE === false ? "primary" : "white"}
                        onClick={() => setOnlyPSE(onlyPSE === false ? null : false)}
                        cursor="pointer"
                        px="18px"
                        py="13px"
                    >
                        <TagLeftIcon boxSize="18px" as={IconCommunity} />
                        <TagLabel>Community</TagLabel>
                    </Tag>
                </HStack>
            </VStack>

            <VStack align="start" spacing="6" ref={viewToScrollRef}>
                <Text fontSize="20">Category</Text>
                <HStack spacing="3" flexWrap="wrap">
                    {getProjectCategories(sortedProjects).map((category) => (
                        <Tag
                            key={category}
                            size="md"
                            variant={selectedCategories.includes(category) ? "solid" : "outline"}
                            colorScheme={selectedCategories.includes(category) ? "primary" : "white"}
                            onClick={() => {
                                const newCategories = selectedCategories.includes(category)
                                    ? selectedCategories.filter((c) => c !== category)
                                    : [...selectedCategories, category]

                                setSelectedCategories(newCategories)
                            }}
                            cursor="pointer"
                        >
                            {category}
                        </Tag>
                    ))}
                </HStack>
            </VStack>

            {projects[index].length > 0 ? (
                <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)", "2xl": "repeat(3, 1fr)" }} gap={6}>
                    {projects[index].map((project) => (
                        <GridItem key={project.name}>
                            <ProjectCard
                                title={project.name}
                                description={project.tagline}
                                categories={project.categories}
                                url={project.links.website}
                                githubUrl={project.links.github}
                                discordUrl={project.links.discord}
                            />
                        </GridItem>
                    ))}
                </Grid>
            ) : (
                <VStack spacing="2">
                    <Text fontSize={{ base: "20px", xs: "18px", sm: "20px" }} align="center">
                        <b>No results found.</b>
                    </Text>
                    <Text fontSize={{ base: "20px", xs: "16px", sm: "18px" }} align="center">
                        No projects matching these filters. Try changing your search.
                    </Text>
                </VStack>
            )}

            {projects.length > 1 && (
                <HStack w="100%">
                    <HStack flex="1" justify="center">
                        <IconButton
                            visibility={index > 0 ? "visible" : "hidden"}
                            onClick={() => changePageIndex(index - 1)}
                            variant="link"
                            aria-label="Arrow left"
                            icon={<IconChevronLeft />}
                        />

                        <HStack spacing="5">
                            {projects.map((_, i) => (
                                <Text
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={i}
                                    onClick={() => changePageIndex(i)}
                                    cursor="pointer"
                                    color={i === index ? "primary.600" : "text.400"}
                                >
                                    {i + 1}
                                </Text>
                            ))}
                        </HStack>

                        <IconButton
                            visibility={index < projects.length - 1 ? "visible" : "hidden"}
                            onClick={() => changePageIndex(index + 1)}
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
