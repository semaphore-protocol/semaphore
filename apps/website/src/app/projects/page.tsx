import { Box, Heading, Text, VStack, Image } from "@chakra-ui/react"
import ActionCard from "../../components/ActionCard"
import ProjectsList from "../../components/ProjectsList"

export default function Projects() {
    return (
        <>
            <VStack pt="170px" pb="56px" w="100%" justify="end" align="start" spacing="40" position="relative">
                <Box
                    zIndex="-1"
                    top="0"
                    left="50%"
                    transform="translateX(-50%)"
                    w="100vw"
                    h="100%"
                    pos="absolute"
                    overflow="hidden"
                >
                    <Image
                        alt=""
                        src="https://semaphore.cedoor.dev/blue-texture.jpg"
                        objectFit="cover"
                        w="full"
                        h="full"
                    />
                </Box>

                <VStack align="start" spacing="4" pb="16">
                    <Heading fontSize={{ base: "40px", sm: "46px", md: "72px" }}>Built with Semaphore</Heading>

                    <Text fontSize={{ base: "16px", sm: "18px", md: "20px" }}>
                        Discover a curated showcase of innovative projects <br /> and applications developed using the
                        Semaphore Protocol.
                    </Text>
                </VStack>
            </VStack>

            <ProjectsList w="100%" align="start" pt="16" spacing="14" />

            <VStack my="128px">
                <ActionCard
                    title="Show what you have built"
                    description="We are missing your project! Add your project to this page and show your awesomeness to the world."
                    buttonText="Submit your project"
                    buttonUrl="https://github.com/semaphore-protocol/semaphore/issues/new?assignees=&labels=documentation++%F0%9F%93%96&projects=&template=----project.md&title="
                />
            </VStack>
        </>
    )
}
