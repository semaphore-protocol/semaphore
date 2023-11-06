import { Box, Button, Card, CardBody, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react"
import { Sora } from "next/font/google"
import ProjectsCarousel from "../components/ProjectsCarousel"
import events from "../data/events.json"
import IconDiscord from "../icons/IconDiscord"

const sora = Sora({
    subsets: ["latin"]
})

export default function Home() {
    return (
        <VStack>
            <VStack h="724" justify="center" spacing="40">
                <Box
                    zIndex="-1"
                    left="0"
                    w="100%"
                    h="724"
                    pos="absolute"
                    bgImg="url('https://semaphore.cedoor.dev/section-1.png')"
                    bgSize="100%"
                    bgPos="center"
                    bgRepeat="no-repeat"
                />

                <VStack spacing="4">
                    <Heading fontSize="72px" textAlign="center">
                        Anonymous interactions
                    </Heading>
                    <Text fontSize="20px" align="center">
                        Using zero knowledge, users can prove their group membership and send <br /> signals such as
                        votes or endorsements without revealing their original identity.
                    </Text>
                </VStack>

                <HStack spacing="8">
                    <Link href="https://semaphore.pse.dev/docs/quick-setup" isExternal>
                        <Button size="lg">Get Started</Button>
                    </Link>
                    <Link href="https://demo.semaphore.pse.dev" isExternal>
                        <Button size="lg" variant="outline">
                            Try the Demo
                        </Button>
                    </Link>
                </HStack>
            </VStack>

            <VStack py="32" spacing="16">
                <Heading fontSize="44px" textAlign="center">
                    Explore projects built with Semaphore
                </Heading>

                <ProjectsCarousel />
            </VStack>

            <Card
                bg="darkBlue"
                color="white"
                borderRadius="18px"
                padding="80px 60px 80px 60px"
                width={{ base: "full", sm: "1110px" }}
                height="680px"
                my="28"
            >
                <CardBody padding="0">
                    <VStack pb="90px">
                        <Heading fontSize="44px" textAlign="center">
                            Semaphore Features
                        </Heading>
                        <Text fontSize="20px" color="alabaster.400" align="center">
                            Duis rhoncus, urna sit amet tristique commodo, turpis justo ullamcorper nisi,
                            <br /> nec dapibus augue nibh sed enim. Nam ultricies finibus fermentum.
                        </Text>
                    </VStack>

                    <VStack spacing="12">
                        <HStack align="top" justify="space-between" spacing="16">
                            <HStack flex="1" align="top" spacing="6">
                                <Heading fontSize="38px" color="#1E46F2" fontFamily={sora.style.fontFamily}>
                                    1
                                </Heading>
                                <VStack align="left">
                                    <Text fontSize="20px" fontFamily={sora.style.fontFamily}>
                                        Simplify privacy
                                    </Text>
                                    <Text color="alabaster.400" fontSize="14px">
                                        Semaphore streamlines privacy-centric app development. It empowers developers to
                                        effortlessly incorporate robust privacy features.
                                    </Text>
                                </VStack>
                            </HStack>
                            <HStack flex="1" align="top" spacing="6">
                                <Heading fontSize="38px" color="#1E46F2" fontFamily={sora.style.fontFamily}>
                                    3
                                </Heading>
                                <VStack align="left">
                                    <Text fontSize="20px" fontFamily={sora.style.fontFamily}>
                                        Universal integrations
                                    </Text>
                                    <Text color="alabaster.400" fontSize="14px">
                                        Semaphore is a protocol for Web2 and Web3. It integrates into any front-end
                                        framework or pure HTML/CSS/JS. It is cross-chain compatible with EVM, L2s, and
                                        alt-blockchains.
                                    </Text>
                                </VStack>
                            </HStack>
                        </HStack>
                        <HStack align="top" justify="space-between" spacing="16">
                            <HStack flex="1" align="top" spacing="6">
                                <Heading fontSize="38px" color="#1E46F2" fontFamily={sora.style.fontFamily}>
                                    2
                                </Heading>
                                <VStack align="left">
                                    <Text fontSize="20px" fontFamily={sora.style.fontFamily}>
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
                                <Heading fontSize="38px" color="#1E46F2" fontFamily={sora.style.fontFamily}>
                                    4
                                </Heading>
                                <VStack align="left">
                                    <Text fontSize="20px" fontFamily={sora.style.fontFamily}>
                                        Free open source software
                                    </Text>
                                    <Text color="alabaster.400" fontSize="14px">
                                        Semaphore is a Public Good. This means it will never seek to profit, it is owned
                                        by the community and will always remain open source.
                                    </Text>
                                </VStack>
                            </HStack>
                        </HStack>
                    </VStack>
                </CardBody>
            </Card>

            <VStack h="759" justify="center" spacing="40" py="32">
                <Box
                    zIndex="-1"
                    left="0"
                    w="100%"
                    h="759"
                    pos="absolute"
                    bgImg="url('https://semaphore.cedoor.dev/section-2.png')"
                    bgSize="100%"
                    bgRepeat="no-repeat"
                />

                <HStack spacing="32">
                    <VStack maxW="450" align="left" spacing="8">
                        <Heading fontSize="44px">Join the Semaphore community</Heading>
                        <Text fontSize="18px">
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

                            <VStack align="left" spacing="10" maxH="500" overflowY="auto">
                                {events.map((event) => (
                                    <VStack key={event.name} align="left">
                                        <Heading fontSize="24px">
                                            {event.date} | {event.name}
                                        </Heading>
                                        <Text fontSize="16px">{event.description}</Text>
                                    </VStack>
                                ))}
                            </VStack>
                        </CardBody>
                    </Card>
                </HStack>
            </VStack>
        </VStack>
    )
}
