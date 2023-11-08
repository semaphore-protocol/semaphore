import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import Image from "next/image"
import ActionCard from "../../components/ActionCard"
import ProjectsList from "../../components/ProjectsList"

export default function Projects() {
    return (
        <VStack>
            <VStack
                h={{ base: "442", sm: "420", md: "393" }}
                w="100%"
                justify="end"
                align="left"
                spacing="40"
                position="relative"
            >
                <Box zIndex="-1" left="50%" transform="translateX(-50%)" w="100vw" h="100%" pos="absolute">
                    <Image
                        alt="Blue texture image"
                        src="https://semaphore.cedoor.dev/blue-texture.jpg"
                        quality="100"
                        sizes="100vw"
                        fill
                        style={{
                            objectFit: "cover"
                        }}
                    />
                </Box>

                <VStack align="left" spacing="4" pb="16">
                    <Heading fontSize={{ base: "40px", sm: "46px", md: "72px" }}>Built with Semaphore</Heading>

                    <Text fontSize={{ base: "16px", sm: "18px", md: "20px" }}>
                        Discover a curated showcase of innovative projects <br /> and applications developed using the
                        Semaphore Protocol.
                    </Text>
                </VStack>
            </VStack>

            <ProjectsList w="100%" align="left" pt="16" spacing="14" />

            <VStack my="128px">
                <ActionCard
                    title="Show what you have built"
                    description="We are missing your project! Add your project to this page and show your awesomeness to the world."
                    buttonText="Submit your project"
                />
            </VStack>
        </VStack>
    )
}
