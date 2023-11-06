"use client"

import { HStack, IconButton, Stack, useBreakpointValue } from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"
import allArticles from "../data/articles.json"
import IconArrowLeft from "../icons/IconArrowLeft"
import IconArrowRight from "../icons/IconArrowRight"
import { circularSlice } from "../utils/circularSlice"
import ArticleCard from "./ArticleCard"

export default function ArticlesCarousel() {
    const variant = useBreakpointValue(
        {
            base: 3,
            sm: 3,
            md: 2,
            lg: 4
        },
        {
            fallback: "md"
        }
    )

    const [articles, setArticles] = useState<typeof allArticles>()
    const [index, setIndex] = useState<number>(0)

    useEffect(() => {
        setArticles(circularSlice(allArticles, index, variant!))
    }, [index, variant])

    const nextProject = useCallback(() => {
        setIndex((i) => (i + 1) % allArticles.length)
    }, [index])

    const previousProject = useCallback(() => {
        setIndex((i) => (i === 0 ? allArticles.length - 1 : i - 1))
    }, [index])

    return (
        <>
            <HStack display={{ base: "none", md: "block" }} w="100%">
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
            <Stack direction={{ base: "column", md: "row" }} spacing="30px">
                {articles &&
                    articles.map((article, i) => (
                        <ArticleCard key={i} title={article.title} minRead={article.minRead} url={article.url} />
                    ))}
            </Stack>
        </>
    )
}
