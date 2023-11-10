import { Flex, Link, Text, VStack, Box } from "@chakra-ui/react"
import Image from "next/image"
import ActionCard from "../../components/ActionCard"
import ToolsCard from "../../components/ToolsCard"
import IconArrowRight from "../../icons/IconArrowRight"
import IconBook from "../../icons/IconBook"
import IconBox from "../../icons/IconBox"
import IconCli from "../../icons/IconCli"

export default function Build() {
    const toolCardsInfo = [
        {
            icon: <IconCli width={8} height={8} color="ceruleanBlue" />,
            title: "CLI",
            subtitle: "INTEGRATE TO YOUR PROJECT",
            details: [
                "Streamline setting up a new Semaphore project",
                "Interact with group, members & proofs data easily",
                "Reduce set-up time from a few minutes to a few seconds"
            ]
        },
        {
            icon: <IconBook width={8} height={8} color="ceruleanBlue" />,
            title: "Boilerplate",
            subtitle: "START FROM TEMPLATE",
            details: [
                "Begin your projects with a ready-to-use example template",
                "Create identity, join group, send anonmous feedback",
                "Easily modify to align with specific project goals"
            ]
        },
        {
            icon: <IconBox width={8} height={8} color="ceruleanBlue" />,
            title: "Packages",
            subtitle: "LEVERAGE DEVELOPED LIBRARIES",
            details: [
                "Curated libraries to enhance your development process",
                "Preconfigured deployments with Hardhat plugin",
                "Facilitate offchain & onchain groups, members & proofs interactions"
            ]
        }
    ]

    const linksInfo = [
        {
            title: "Good first issues",
            href: "https://github.com/semaphore-protocol/semaphore/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22"
        },
        {
            title: "Enhance the protocol",
            href: "https://github.com/semaphore-protocol/semaphore/discussions/new?category=ideas"
        },
        {
            title: "Give feedback about the website",
            href: "https://github.com/semaphore-protocol/semaphore/discussions/new?category=website"
        }
    ]
    return (
        <VStack justify="center">
            <VStack mt="90px">
                <Text textAlign="center" fontSize={{ base: "40px", md: "72px" }}>
                    Let’s build something new
                </Text>
                <Text textAlign="center" fontSize={{ base: "16px", md: "20px" }} color="alabaster.400" mt="14px">
                    Jumpstart your app development process with these building tools.
                </Text>
                <VStack mt="64px">
                    <Flex gap="33px" wrap="wrap" justifyContent="center">
                        {toolCardsInfo.map((toolCardInfo) => (
                            <ToolsCard
                                key={toolCardInfo.title}
                                title={toolCardInfo.title}
                                subtitle={toolCardInfo.subtitle}
                                icon={toolCardInfo.icon}
                                details={toolCardInfo.details}
                            />
                        ))}
                    </Flex>
                </VStack>
            </VStack>
            <Flex
                justifyContent="space-between"
                mt="128px"
                direction="row"
                backgroundColor="darkBlue"
                p="0"
                w="100vw"
                maxW="1440px"
                h="auto"
                wrap={{ base: "wrap", xl: "nowrap" }}
            >
                <Flex
                    justify="center"
                    alignItems="center"
                    mt={{ base: "120px", xl: "125px" }}
                    ml={{ base: "32px", xl: "80px" }}
                    mr={{ base: "32px", xl: "188px" }}
                    mb={{ base: "120px", xl: "109px" }}
                    w={{ base: "auto", xl: "445px" }}
                >
                    <VStack alignItems="left">
                        <Text fontSize={{ base: "30px", md: "44px" }} fontWeight="500">
                            Contribute to Semaphore
                        </Text>
                        <Text fontSize={{ base: "16px", md: "18px" }} color="alabaster.300" mt="16px">
                            Semaphore is open source with dozens of community contributors. You can propose improvements
                            to the protocol or take good first issues to get started.
                        </Text>
                        <VStack mt="40px" alignItems="left">
                            {linksInfo.map((linkInfo) => (
                                <Link
                                    display="flex"
                                    alignItems="center"
                                    gap="10px"
                                    justifyItems="center"
                                    href={linkInfo.href}
                                    isExternal
                                    key={linkInfo.title}
                                >
                                    <Text
                                        borderBottomWidth="1px"
                                        borderBottomColor="white"
                                        _hover={{ borderBottomColor: "transparent" }}
                                        fontSize="18px"
                                        fontWeight="normal"
                                    >
                                        {linkInfo.title}
                                    </Text>
                                    <IconArrowRight width="14px" />
                                </Link>
                            ))}
                        </VStack>
                    </VStack>
                </Flex>
                <Box position="relative" w={{ base: "full", xl: "727px" }} h="630">
                    <Image
                        src="https://semaphore.cedoor.dev/flower-shadow.jpg"
                        alt="Flower Shadow"
                        fill
                        quality="100"
                        style={{
                            objectFit: "cover"
                        }}
                    />
                </Box>
            </Flex>
            <VStack my="128">
                <ActionCard
                    title="Project ideas to explore with Semaphore"
                    description="The team has created this list of project ideas to build with Semaphore, but there are many more to be discovered."
                    buttonText="Get inspired"
                />
            </VStack>
        </VStack>
    )
}
