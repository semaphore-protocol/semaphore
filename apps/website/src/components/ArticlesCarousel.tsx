"use client"

import { Box, HStack, IconButton, VStack, useBreakpointValue, Text } from "@chakra-ui/react"
import { useCallback, useState } from "react"
import articles from "../data/articles.json"
import IconArrowLeft from "../icons/IconArrowLeft"
import IconArrowRight from "../icons/IconArrowRight"
import ArticleCard from "./ArticleCard"

export default function VideosCarousel() {
    const [index, setIndex] = useState<number>(0)
    const numberOfItems = useBreakpointValue({
        base: 1,
        md: 2,
        lg: 4
    })

    const nextProject = useCallback(() => {
        if (index + 1 === Math.ceil(articles.length / numberOfItems!)) {
            setIndex(0)
        } else {
            setIndex((prevIndex) => prevIndex + 1)
        }
    }, [index, numberOfItems])

    const previousProject = useCallback(() => {
        if (index === 0) {
            setIndex(Math.ceil(articles.length / numberOfItems!) - 1)
        } else {
            setIndex((prevIndex) => prevIndex - 1)
        }
    }, [index])

    return (
        <>
            <HStack display={"flex"} w="full" mb={"56px"}>
                <HStack flex="1" justify={"left"}>
                    <Text flex="1" textAlign={"left"} fontSize="44px" fontWeight={"500"}>
                        Articles
                    </Text>
                </HStack>

                <HStack flex="1" justify="end">
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
            </HStack>
            <HStack display={"flex"} w="full" overflow="hidden">
                <HStack
                    w="full"
                    transition="transform 0.4s ease-in-out"
                    transform={`translateX(-${index * 100}%)`}
                    py="1"
                    spacing="0"
                >
                    {articles.map((article, i) => (
                        <VStack key={i} minW={{ base: `${100 / 1}%`, md: `${100 / 2}%`, lg: `${100 / 4}%` }}>
                            <Box px="3">
                                <ArticleCard
                                    key={i}
                                    title={article.title}
                                    minRead={article.minRead}
                                    url={article.url}
                                />
                            </Box>
                        </VStack>
                    ))}
                </HStack>
            </HStack>
        </>
    )
}
