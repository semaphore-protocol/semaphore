import { Text, VStack, Flex, Link } from "@chakra-ui/react"
import IconCli from "@/icons/IconCli"
import IconBook from "@/icons/IconBook"
import IconBox from "@/icons/IconBox"
import ToolsCard from "@/components/ToolsCard"
import IconArrowRight from "@/icons/IconArrowRight"
import ActionCard from "@/components/ActionCard"
import Image from "next/image"

export default function Build() {
    const toolCardInfo = [
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
            href: ""
        },
        {
            title: "Give feedback about the website",
            href: ""
        }
    ]
    return (
        <VStack justify="center">
            <VStack mt={"90px"}>
                <Text fontSize={"72px"}>Let’s build something new</Text>
                <Text color={"alabaster.400"} mt={"14px"}>
                    Jumpstart your app development process with these building tools.
                </Text>
                <VStack mt={"64px"}>
                    <Flex gap={"33px"} wrap={"wrap"} justifyContent={"center"}>
                        {toolCardInfo.map((toolCardInfo, i) => (
                            <ToolsCard
                                key={i}
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
                justifyContent={"space-between"}
                mt={"128px"}
                direction={"row"}
                backgroundColor={"darkBlue"}
                p={"0"}
                w={"100vw"}
                h={"auto"}
                wrap={"wrap"}
            >
                <Flex
                    justify={"center"}
                    alignItems={"center"}
                    mt={"125px"}
                    ml={"80px"}
                    mr={"188px"}
                    mb={"109px"}
                    w={"445px"}
                >
                    <VStack alignItems={"left"}>
                        <Text fontSize={"44px"} fontWeight={"500"}>
                            Contribute to Semaphore
                        </Text>
                        <Text color={"alabaster.300"} mt={"16px"}>
                            Semaphore is open source with dozens of community contributors. You can propose improvements
                            to the protocol or take good first issues to get started.
                        </Text>
                        <VStack mt={"40px"} alignItems={"left"}>
                            {linksInfo.map((linkInfo, i) => (
                                <Link
                                    display={"flex"}
                                    alignItems={"center"}
                                    gap={"10px"}
                                    justifyItems={"center"}
                                    href={linkInfo.href}
                                    isExternal
                                    key={i}
                                >
                                    <Text
                                        borderBottomWidth={"1px"}
                                        borderBottomColor={"white"}
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
                <Image
                    src="/flower-shadow.png"
                    width={727}
                    height={630}
                    style={{ maxHeight: "630px" }}
                    alt="Flower Shadow"
                />
            </Flex>
            <VStack my={"128"}>
                <ActionCard
                    title="Project ideas to explore with Semaphore"
                    description="The team has created this list of project ideas to build with Semaphore, but there are many more to be discovered."
                    buttonText="Get inspired"
                />
            </VStack>
        </VStack>
    )
}
