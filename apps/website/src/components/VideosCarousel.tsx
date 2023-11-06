"use client"

import { HStack, IconButton, Stack, useBreakpointValue } from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"
import allVideos from "../data/videos.json"
import IconArrowLeft from "../icons/IconArrowLeft"
import IconArrowRight from "../icons/IconArrowRight"
import { circularSlice } from "../utils/circularSlice"
import VideoCard from "./VideoCard"

export default function VideosCarousel() {
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

    const [videos, setVideos] = useState<typeof allVideos>()
    const [index, setIndex] = useState<number>(0)

    useEffect(() => {
        setVideos(circularSlice(allVideos, index, variant!))
    }, [index, variant])

    const nextProject = useCallback(() => {
        setIndex((i) => (i + 1) % allVideos.length)
    }, [index])

    const previousProject = useCallback(() => {
        setIndex((i) => (i === 0 ? allVideos.length - 1 : i - 1))
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
                {videos &&
                    videos.map((video, i) => (
                        <VideoCard key={i} title={video.title} embeddedVideoUrl={video.embeddedUrl} />
                    ))}
            </Stack>
        </>
    )
}
