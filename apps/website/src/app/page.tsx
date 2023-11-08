import { Box, Button, Card, CardBody, Heading, HStack, Link, Stack, Text, VStack } from "@chakra-ui/react"
import { Sora } from "next/font/google"
import Image from "next/image"
import ProjectsCarousel from "../components/ProjectsCarousel"
import events from "../data/events.json"
import IconDiscord from "../icons/IconDiscord"

const sora = Sora({
    subsets: ["latin"]
})

export default function Home() {
    return (
        <VStack>
            <VStack h={{ base: "718", sm: "734", md: "724" }} justify="center" spacing="40" position="relative">
                <Box zIndex="-1" left="50%" transform="translateX(-50%)" w="100vw" h="100%" pos="absolute">
                    <Image
                        alt="Midnight whispers image"
                        src="https://semaphore.cedoor.dev/midnight-whispers.png"
                        quality="100"
                        sizes="100vw"
                        fill
                        style={{
                            objectFit: "cover"
                        }}
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
                    <Link href="https://semaphore.pse.dev/docs/quick-setup" isExternal>
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
                <Heading fontSize={{ base: "30px", md: "44px" }} textAlign="center">
                    Explore projects built with Semaphore
                </Heading>

                <ProjectsCarousel />
            </VStack>

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
                                <VStack align="left">
                                    <Text fontSize={{ base: "18px", md: "20px" }} fontFamily={sora.style.fontFamily}>
                                        Simplify privacy
                                    </Text>
                                    <Text color="alabaster.400" fontSize="14px">
                                        Semaphore streamlines privacy-centric app development. It empowers developers to
                                        effortlessly incorporate robust privacy features.
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
                                <VStack align="left">
                                    <Text fontSize={{ base: "18px", md: "20px" }} fontFamily={sora.style.fontFamily}>
                                        Universal integrations
                                    </Text>
                                    <Text color="alabaster.400" fontSize="14px">
                                        Semaphore is a protocol for Web2 and Web3. It integrates into any front-end
                                        framework or pure HTML/CSS/JS. It is cross-chain compatible with EVM, L2s, and
                                        alt-blockchains.
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
                                <VStack align="left">
                                    <Text fontSize={{ base: "18px", md: "20px" }} fontFamily={sora.style.fontFamily}>
                                        Leverage Zero Knowledge
                                    </Text>
                                    <Text color="alabaster.400" fontSize="14px">
                                        Semaphore leverages Zero Knowledge, allowing us to verify information without
                                        revealing any underlying data. This powerful primitive allows one to prove
                                        membership and signal anonymously.
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
                                <VStack align="left">
                                    <Text fontSize={{ base: "18px", md: "20px" }} fontFamily={sora.style.fontFamily}>
                                        Free open source software
                                    </Text>
                                    <Text color="alabaster.400" fontSize="14px">
                                        Semaphore is a Public Good. This means it will never seek to profit, it is owned
                                        by the community and will always remain open source.
                                    </Text>
                                </VStack>
                            </HStack>
                        </Stack>
                    </VStack>
                </CardBody>
            </Card>

            <VStack justify="center" spacing="40" py="32" position="relative">
                <Box zIndex="-1" left="50%" transform="translateX(-50%)" w="100vw" h="100%" pos="absolute">
                    <Image
                        alt="Fluttering shadow image"
                        src="https://semaphore.cedoor.dev/shadow-flutter.png"
                        quality="100"
                        sizes="100vw"
                        fill
                        style={{
                            objectFit: "cover"
                        }}
                    />
                </Box>

                <Stack direction={{ base: "column", md: "row" }} px={{ base: "0", md: "12" }} spacing="32">
                    <VStack maxW="450" align="left" spacing="8">
                        <Heading fontSize={{ base: "30px", md: "44px" }}>Join the Semaphore community</Heading>
                        <Text fontSize={{ base: "16px", md: "18px" }}>
                            Ask questions, suggest ideas, stay up-to-date, and meet other people building privacy
                            applications with Zero Knowledge.
                        </Text>
                        <Link href="https://semaphore.pse.dev/discord" isExternal>
                            <Button leftIcon={<IconDiscord />} size="lg">
                                Discord
                            </Button>
                        </Link>
                    </VStack>

                    <Card
                        bg="inherit"
                        color="white"
                        backdropFilter="blur(4px)"
                        borderRadius="18px"
                        border="1px"
                        borderColor="white"
                        padding="50px"
                    >
                        <CardBody padding="0">
                            <Heading fontSize="30px" mb="50px">
                                Upcoming Events
                            </Heading>

                            <VStack align="left" spacing="10" maxH="600" overflowY="auto">
                                {events.map((event) => (
                                    <VStack key={event.name} align="left">
                                        <Heading fontSize={{ base: "20px", md: "24px" }}>
                                            {event.date} | {event.name}
                                        </Heading>
                                        <Text fontSize="16px">{event.description}</Text>
                                    </VStack>
                                ))}
                            </VStack>
                        </CardBody>
                    </Card>
                </Stack>
            </VStack>
        </VStack>
    )
}
