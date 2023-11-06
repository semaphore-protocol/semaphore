import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import ActionCard from "../../components/ActionCard"
import ProjectsList from "@/components/ProjectsList"

export default function Projects() {
    return (
        <VStack>
            <VStack h={{ base: "442", sm: "420", md: "393" }} w="100%" justify="end" align="left" spacing="40">
                <Box
                    zIndex="-1"
                    left="0"
                    w="100%"
                    h={{ base: "442", sm: "420", md: "393" }}
                    pos="absolute"
                    bgImg="url('https://semaphore.cedoor.dev/section-3.png')"
                    bgSize="100%"
                    bgPos="center"
                    bgRepeat="no-repeat"
                />

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
