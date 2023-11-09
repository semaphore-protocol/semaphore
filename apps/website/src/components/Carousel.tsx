"use client"

import { Box, HStack, Heading, IconButton, Link, StackProps, VStack, useBreakpointValue } from "@chakra-ui/react"
import NextLink from "next/link"
import { useCallback, useState } from "react"
import articles from "../data/articles.json"
import projects from "../data/projects.json"
import videos from "../data/videos.json"
import IconArrowLeft from "../icons/IconArrowLeft"
import IconArrowRight from "../icons/IconArrowRight"
import { getDataLength } from "../utils/getDataLength"
import ArticleCard from "./ArticleCard"
import ProjectCard from "./ProjectCard"
import VideoCard from "./VideoCard"

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
    }, [index])

    return (
        <VStack align="left" w="full" {...props} spacing="12">
            <HStack justify="space-between">
                <Heading fontSize={{ base: "30px", md: "44px" }} textAlign={type === "projects" ? "center" : "left"}>
                    {title}
                </Heading>

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
                >
                    {type === "projects" &&
                        projects.map((project, i) => (
                            <Link
                                minW={`${100 / size!}%`}
                                key={project.name + i}
                                href={project.links.github}
                                isExternal
                                visibility={!size ? "hidden" : "visible"}
                            >
                                <Box px="3">
                                    <ProjectCard
                                        title={project.name}
                                        description={project.tagline}
                                        tags={project.tags}
                                    />
                                </Box>
                            </Link>
                        ))}

                    {type === "articles" &&
                        articles.map((article, i) => (
                            <Box
                                visibility={!size ? "hidden" : "visible"}
                                px="3"
                                minW={`${100 / size!}%`}
                                key={article.title + i}
                            >
                                <ArticleCard
                                    key={i}
                                    title={article.title}
                                    minRead={article.minRead}
                                    url={article.url}
                                />
                            </Box>
                        ))}

                    {type === "videos" &&
                        videos.map((video, i) => (
                            <Box
                                visibility={!size ? "hidden" : "visible"}
                                px="3"
                                minW={`${100 / size!}%`}
                                key={video.title + i}
                            >
                                <VideoCard key={i} title={video.title} embeddedVideoUrl={video.embeddedUrl} />
                            </Box>
                        ))}
                </HStack>
            </HStack>

            {type === "projects" && (
                <HStack w="100%">
                    <Box flex="1" />

                    <HStack flex="1" justify="center" visibility={!size ? "hidden" : "visible"}>
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
