import { Box, Button, Card, CardBody, HStack, Heading, Image, Link, Stack, Text, VStack } from "@chakra-ui/react"
import { Sora } from "next/font/google"
import NextLink from "next/link"
import Carousel from "../components/Carousel"
import ProjectCard from "../components/ProjectCard"
import events from "../data/events.json"
import allProjects from "../data/projects.json"
import IconTelegram from "../icons/IconTelegram"
import HRoadmap from "@/components/HRoadmap"
import VRoadmap from "@/components/VRoadmap"

const sora = Sora({
    subsets: ["latin"]
})

export default function Home() {
    return (
        <>
            <VStack pt="170px" pb={{ base: "128px", md: "170px" }} justify="center" spacing="20" position="relative">
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
                        src="https://semaphore.cedoor.dev/midnight-whispers.jpg"
                        objectFit="cover"
                        w="full"
                        h="full"
                    />
                </Box>

                <VStack spacing="4">
                    <Heading fontSize={{ base: "40px", sm: "46px", md: "72px" }} textAlign="center">
                        Anonymous interactions
                    </Heading>
                    <Text fontSize={{ base: "16px", sm: "18px", md: "20px" }} align="center" maxW="800px">
                        Using zero knowledge, users can prove their group membership and send signals such as votes or
                        endorsements without revealing their original identity.
                    </Text>
                </VStack>

                <Stack direction={{ base: "column", sm: "row" }} spacing="6" align="center">
                    <Link href="https://docs.semaphore.pse.dev/getting-started" isExternal>
                        <Button size={{ base: "md", md: "lg" }}>Get Started</Button>
                    </Link>
                    <Link href="https://demo.semaphore.pse.dev" isExternal>
                        <Button size={{ base: "md", md: "lg" }} variant="outline">
                            Try the Demo
                        </Button>
                    </Link>
                </Stack>
            </VStack>

            <VStack py="32" spacing="16" w="full">
                <Carousel
                    display={{ base: "none", md: "flex" }}
                    title="Explore projects built with Semaphore"
                    sizes={{ md: 2, lg: 3 }}
                    type="projects"
                />

                <VStack display={{ base: "flex", md: "none" }} spacing="16">
                    <Heading fontSize={{ base: "30px", md: "44px" }} textAlign="center">
                        Explore projects built with Semaphore
                    </Heading>

                    <VStack spacing="3">
                        {allProjects.slice(0, 3).map((project) => (
                            <ProjectCard
                                key={project.name}
                                title={project.name}
                                description={project.tagline}
                                categories={project.categories}
                                url={project.links.website}
                                githubUrl={project.links.github}
                                discordUrl={project.links.discord}
                            />
                        ))}
                    </VStack>

                    <HStack justify="center" fontSize="12px">
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
                </VStack>
            </VStack>

            <HStack justify="center">
                <Card
                    bg="darkBlue"
                    color="white"
                    borderRadius="18px"
                    padding="80px 60px 80px 60px"
                    maxW="1110px"
                    mt="20"
                    mb="28"
                >
                    <CardBody padding="0">
                        <Heading fontSize={{ base: "30px", md: "44px" }} textAlign="center" pb="90px">
                            Semaphore Features
                        </Heading>

                        <VStack spacing="16">
                            <Stack
                                direction={{ base: "column", md: "row" }}
                                align="top"
                                justify="space-between"
                                spacing="16"
                            >
                                <HStack flex="1" align="top" spacing="6">
                                    <Heading
                                        fontSize={{ base: "30px", md: "38px" }}
                                        color="#1E46F2"
                                        fontFamily={sora.style.fontFamily}
                                    >
                                        1
                                    </Heading>
                                    <VStack align="start">
                                        <Text
                                            fontSize={{ base: "18px", md: "20px" }}
                                            fontFamily={sora.style.fontFamily}
                                        >
                                            Simplified privacy
                                        </Text>
                                        <Text color="text.400" fontSize="14px">
                                            Semaphore streamlines privacy-centric app development. It empowers
                                            developers to effortlessly incorporate robust privacy features.
                                        </Text>
                                    </VStack>
                                </HStack>
                                <HStack flex="1" align="top" spacing="6">
                                    <Heading
                                        fontSize={{ base: "30px", md: "38px" }}
                                        color="#1E46F2"
                                        fontFamily={sora.style.fontFamily}
                                    >
                                        3
                                    </Heading>
                                    <VStack align="start">
                                        <Text
                                            fontSize={{ base: "18px", md: "20px" }}
                                            fontFamily={sora.style.fontFamily}
                                        >
                                            Universal integrations
                                        </Text>
                                        <Text color="text.400" fontSize="14px">
                                            Semaphore is a protocol for Web2 and Web3. It integrates into any front-end
                                            framework or pure HTML/CSS/JS. It is cross-chain compatible with EVM, L2s,
                                            and alt-blockchains.
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Stack>
                            <Stack
                                direction={{ base: "column", md: "row" }}
                                align="top"
                                justify="space-between"
                                spacing="16"
                            >
                                <HStack flex="1" align="top" spacing="6">
                                    <Heading
                                        fontSize={{ base: "30px", md: "38px" }}
                                        color="#1E46F2"
                                        fontFamily={sora.style.fontFamily}
                                    >
                                        2
                                    </Heading>
                                    <VStack align="start">
                                        <Text
                                            fontSize={{ base: "18px", md: "20px" }}
                                            fontFamily={sora.style.fontFamily}
                                        >
                                            Leverage Zero Knowledge
                                        </Text>
                                        <Text color="text.400" fontSize="14px">
                                            Semaphore leverages Zero Knowledge, allowing us to verify information
                                            without revealing any underlying data. This powerful primitive allows one to
                                            prove membership and signal anonymously.
                                        </Text>
                                    </VStack>
                                </HStack>
                                <HStack flex="1" align="top" spacing="6">
                                    <Heading
                                        fontSize={{ base: "30px", md: "38px" }}
                                        color="#1E46F2"
                                        fontFamily={sora.style.fontFamily}
                                    >
                                        4
                                    </Heading>
                                    <VStack align="start">
                                        <Text
                                            fontSize={{ base: "18px", md: "20px" }}
                                            fontFamily={sora.style.fontFamily}
                                        >
                                            Free open source software
                                        </Text>
                                        <Text color="text.400" fontSize="14px">
                                            Semaphore is a Public Good. This means it will never seek to profit, it is
                                            owned by the community and will always remain open source.
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Stack>
                        </VStack>
                    </CardBody>
                </Card>
            </HStack>

            <VStack mb="32" spacing="32">
                <VStack w="full" maxW="1110px">
                    <Heading fontSize={{ base: "30px", md: "44px" }} pb="90px">
                        2024-2025 Roadmap
                    </Heading>

                    <HStack display={{ base: "none", md: "flex" }} w="full" mt="60px">
                        <HRoadmap />
                    </HStack>

                    <VStack display={{ base: "flex", md: "none" }}>
                        <VRoadmap />
                    </VStack>
                </VStack>

                <VStack maxW="650" align="center" spacing="8">
                    <Heading fontSize={{ base: "30px", md: "44px" }}>Join the Semaphore community</Heading>
                    <Text fontSize={{ base: "16px", md: "18px" }} textAlign="center">
                        Ask questions, suggest ideas, stay up-to-date, and meet other people building privacy
                        applications with Zero Knowledge.
                    </Text>
                    <Link href="https://semaphore.pse.dev/telegram" isExternal>
                        <Button leftIcon={<IconTelegram />} size="lg">
                            Telegram
                        </Button>
                    </Link>
                </VStack>
            </VStack>

            <VStack justify="center" spacing="40" py="32" position="relative">
                <Box
                    zIndex="-1"
                    left="50%"
                    transform="translateX(-50%)"
                    w="100vw"
                    h="100%"
                    pos="absolute"
                    overflow="hidden"
                >
                    <Image
                        alt=""
                        src="https://semaphore.cedoor.dev/shadow-flutter.jpg"
                        objectFit="cover"
                        w="full"
                        h="full"
                    />
                </Box>

                <Stack direction={{ base: "column", md: "row" }} px={{ base: "0", md: "12" }} w="full">
                    <Box flex="1" />

                    <Card
                        flex="1"
                        bg="darkBlue"
                        color="white"
                        borderRadius="18px"
                        border="1px"
                        borderColor="text.900"
                        padding="50px"
                    >
                        <CardBody padding="0">
                            <Heading fontSize="30px" mb="50px">
                                Upcoming Events
                            </Heading>

                            <VStack align="start" spacing="10" maxH="600px" overflowY="auto">
                                {events.map((event) => (
                                    <Link href={event.link} key={event.name} isExternal>
                                        <VStack align="start">
                                            <Heading fontSize={{ base: "20px", md: "24px" }}>
                                                {event.date} | {event.name}
                                            </Heading>
                                            <Text fontSize="16px">{event.description}</Text>
                                        </VStack>
                                    </Link>
                                ))}
                            </VStack>
                        </CardBody>
                    </Card>
                </Stack>
            </VStack>
        </>
    )
}
