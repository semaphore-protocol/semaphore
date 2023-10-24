"use client"

import { Box, Button, Card, CardBody, Heading, HStack, IconButton, Link, Text, VStack } from "@chakra-ui/react"
import { Sora } from "next/font/google"
import ProjectCard from "../components/ProjectCard"
import IconArrowLeft from "../icons/IconArrowLeft"
import IconArrowRight from "../icons/IconArrowRight"

const sora = Sora({
    subsets: ["latin"]
})

export default function Home() {
    return (
        <VStack>
            <Box
                zIndex="-1"
                left="0"
                w="100%"
                h="724"
                pos="absolute"
                bgImg="url('./section-1.png')"
                bgSize="100%"
                bgPos="center"
                bgRepeat="no-repeat"
            />

            <VStack h="724" justify="center" spacing="40">
                <VStack>
                    <Heading fontSize="72px" textAlign="center">
                        Anonymous interactions
                    </Heading>
                    <Text fontSize="20px" align="center">
                        Using zero knowledge, users can prove their group membership and send <br /> signals such as
                        votes or endorsements without revealing their original identity.
                    </Text>
                </VStack>

                <HStack spacing="8">
                    <Link href="https://demo.semaphore.pse.dev" target="_blank">
                        <Button size="lg">Try the Demo</Button>
                    </Link>
                    <Link
                        href="https://github.com/semaphore-protocol/semaphore/tree/main/packages/cli#--------semaphore-cli----"
                        target="_blank"
                    >
                        <Button size="lg" variant="outline">
                            Build with CLI
                        </Button>
                    </Link>
                    <Link href="https://github.com/semaphore-protocol/boilerplate" target="_blank">
                        <Button size="lg" variant="outline">
                            Build with Boilerplate
                        </Button>
                    </Link>
                </HStack>
            </VStack>

            <VStack py="32" spacing="16">
                <Heading fontSize="44px" textAlign="center">
                    Explore projects built with Semaphore
                </Heading>

                <HStack spacing="8">
                    <Link href="" target="_blank">
                        <ProjectCard
                            title="Project Name"
                            description="Malesuada facilisi libero, nam eu. Quis pellentesque tortor a elementum ut blandit sed pellentesque arcu."
                            tags={["Tag", "Tag", "Tag"]}
                        />
                    </Link>
                    <Link href="" target="_blank">
                        <ProjectCard
                            title="Project Name"
                            description="Malesuada facilisi libero, nam eu. Quis pellentesque tortor a elementum ut blandit sed pellentesque arcu."
                            tags={["Tag", "Tag", "Tag"]}
                        />
                    </Link>
                    <Link href="" target="_blank">
                        <ProjectCard
                            title="Project Name"
                            description="Malesuada facilisi libero, nam eu. Quis pellentesque tortor a elementum ut blandit sed pellentesque arcu."
                            tags={["Tag", "Tag", "Tag"]}
                        />
                    </Link>
                </HStack>

                <HStack w="100%">
                    <Box flex="1" />

                    <HStack flex="1" justify="center">
                        <IconButton variant="link" aria-label="Arrow left" icon={<IconArrowLeft />} />
                        <IconButton variant="link" aria-label="Arrow right" icon={<IconArrowRight />} />
                    </HStack>

                    <HStack flex="1" justify="right" fontSize="12px">
                        <Link
                            href=""
                            target="_blank"
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
            </VStack>

            <Card
                bg="darkBlue"
                color="white"
                borderRadius="18px"
                padding="80px 60px 80px 60px"
                width={{ base: "full", sm: "1110px" }}
                height="680px"
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
        </VStack>
    )
}
