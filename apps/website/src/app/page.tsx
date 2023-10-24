"use client"

import { Box, Button, Heading, HStack, IconButton, Link, Text, VStack } from "@chakra-ui/react"
import ProjectCard from "../components/ProjectCard"
import IconArrowLeft from "../icons/IconArrowLeft"
import IconArrowRight from "../icons/IconArrowRight"

export default function Home() {
    return (
        <>
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
        </>
    )
}
