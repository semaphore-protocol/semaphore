"use client"

import { Box, HStack, Heading, IconButton, Link, StackProps, VStack, useBreakpointValue } from "@chakra-ui/react"
import NextLink from "next/link"
import { useCallback, useState } from "react"
import allArticles from "../data/articles.json"
import allProjects from "../data/projects.json"
import videos from "../data/videos.json"
import IconArrowLeft from "../icons/IconArrowLeft"
import IconArrowRight from "../icons/IconArrowRight"
import { getDataLength } from "../utils/getDataLength"
import ArticleCard from "./ArticleCard"
import ProjectCard from "./ProjectCard"
import VideoCard from "./VideoCard"
import { sortByDate } from "@/utils/sortByDate"

export type CarouselProps = {
    title: string
    sizes: {
        base?: number
        sm?: number
        md?: number
        lg?: number
    }
    type: "projects" | "videos" | "articles"
}

export default function Carousel({ title, sizes, type, ...props }: CarouselProps & StackProps) {
    const [index, setIndex] = useState<number>(0)
    const size = useBreakpointValue<number>(sizes)

    const nextProject = useCallback(() => {
        if (index + 1 === Math.ceil(getDataLength(type) / size!)) {
            setIndex(0)
        } else {
            setIndex((prevIndex) => prevIndex + 1)
        }
    }, [index, size])

    const previousProject = useCallback(() => {
        if (index === 0) {
            setIndex(Math.ceil(getDataLength(type) / size!) - 1)
        } else {
            setIndex((prevIndex) => prevIndex - 1)
        }
    }, [index, size])

    return (
        <VStack align="start" w="full" spacing="16" {...props}>
            <HStack justify={type === "projects" ? "center" : "space-between"}>
                <Heading fontSize={{ base: "30px", md: "44px" }}>{title}</Heading>

                {type !== "projects" && (
                    <HStack visibility={!size ? "hidden" : "visible"}>
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
                )}
            </HStack>

            <HStack w="full" overflow="hidden">
                <HStack
                    w="full"
                    transition="transform 0.4s ease-in-out"
                    transform={`translateX(-${index * 100}%)`}
                    py="1"
                    spacing="0"
                    align="stretch"
                >
                    {type === "projects" &&
                        allProjects.map((project) => (
                            <Box
                                visibility={!size ? "hidden" : "visible"}
                                px="3"
                                minW={`${100 / size!}%`}
                                key={project.name}
                            >
                                <ProjectCard
                                    title={project.name}
                                    description={project.tagline}
                                    categories={project.categories}
                                    url={project.links.website}
                                    githubUrl={project.links.github}
                                    discordUrl={project.links.discord}
                                />
                            </Box>
                        ))}

                    {type === "articles" &&
                        sortByDate(allArticles).map((article) => (
                            <Box
                                visibility={!size ? "hidden" : "visible"}
                                px="3"
                                minW={`${100 / size!}%`}
                                key={article.title + article.url}
                            >
                                <ArticleCard title={article.title} minRead={article.minRead} url={article.url} />
                            </Box>
                        ))}

                    {type === "videos" &&
                        sortByDate(videos).map((video) => (
                            <Box
                                visibility={!size ? "hidden" : "visible"}
                                px="3"
                                minW={`${100 / size!}%`}
                                key={video.title + video.url}
                            >
                                <VideoCard title={video.title} thumbnail={video.thumbnail} url={video.url} />
                            </Box>
                        ))}
                </HStack>
            </HStack>

            {type === "projects" && (
                <HStack w="100%">
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
            )}
        </VStack>
    )
}
