import {
    Flex,
    Link,
    Text,
    VStack,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Divider,
    Box,
    Image
} from "@chakra-ui/react"
import InfoCard, { InfoBlock } from "../../components/InfoCard"
import SectionBlock, { SectionBlockProps } from "../../components/SectionBlock"
import IconEyelash from "@/icons/IconEyelash"
import IconEye from "@/icons/IconEye"
import IconUser from "@/icons/IconUser"
import IconTree from "@/icons/IconTree"
import IconManageUsers from "@/icons/IconManageUsers"
import IconGroup from "@/icons/IconGroup"
import IconBadge from "@/icons/IconBadge"
import IconCheck from "@/icons/IconCheck"
import IconFlag from "@/icons/IconFlag"
import Carousel from "@/components/Carousel"
import videos from "../../data/videos.json"
import VideoCard from "../../components/VideoCard"
import articles from "../../data/articles.json"
import ArticleCard from "../../components/ArticleCard"
import { sortByDate } from "@/utils/sortByDate"

export default function Learn() {
    const infoCardTexts: InfoBlock[][] = [
        [
            {
                title: "Accessibility",
                body: "To reach a very large group of developers, a protocol needs to be extremely user-friendly, understandable and simple."
            },
            {
                title: "Composability",
                body: "Achieve an excellent balance between simplicity and functionality through modularity, autonomy, and interoperability. "
            },
            {
                title: "Efficiency",
                body: "A protocol must not only work, it must also be extremely efficient if the goal is to support privacy by default for everyone."
            }
        ],
        [
            {
                title: "Developer experience",
                body: "Enabling developers to focus on innovation by simplifying complexities while supporting diverse use cases."
            },
            {
                title: "Education",
                body: "Empowering individuals with knowledge, resources, and support, ensuring they're equipped to innovate and solve challenges."
            },
            {
                title: "Community",
                body: "Fostering spaces where collaboration thrives, ideas flourish, and diverse voices are celebrated."
            }
        ],
        [
            {
                title: "Completeness",
                body: "If the statement is true, an honest verifier will be convinced of this fact by an honest prover every time."
            },
            {
                title: "Soundness",
                body: "If the statement is false, no cheating prover can convince an honest verifier that is true, except with some small probability."
            },
            {
                title: "Zero-knowledge",
                body: "If the statement is true, no verifier learns anything other than the fact that the statement is true."
            }
        ]
    ]

    const sectionBlockTexts: SectionBlockProps[] = [
        {
            title: "Semaphore identities",
            description:
                "Given to all Semaphore group members, it is comprised of three parts - identity commitment, trapdoor, and nullifier.",
            linkText: "Create Semaphore identities",
            linkUrl: "https://semaphore.pse.dev/docs/guides/identities",
            codeText: `import { Identity } from "@semaphore-protocol/identity"

const identity = new Identity()

const trapdoor = identity.getTrapdoor()
const nullifier = identity.getNullifier()
const commitment = identity.generateCommitment()`,
            itemList: [
                {
                    icon: <IconEyelash w="24px" h="24px" color="ceruleanBlue" />,
                    heading: "Private values",
                    body: "Trapdoor and nullifier values are the private values of the Semaphore identity. To avoid fraud, the owner must keep both values secret."
                },
                {
                    icon: <IconEye w="24px" h="24px" color="ceruleanBlue" />,
                    heading: "Public values",
                    body: "Semaphore uses the Poseidon hash function to create the identity commitment from the identity private values. Identity commitments can be made public, similarly to Ethereum addresses."
                },
                {
                    icon: <IconUser w="24px" h="24px" color="ceruleanBlue" />,
                    heading: "Generate identities",
                    body: "Semaphore identities can be generated deterministically or randomly. Deterministic identities can be generated from the hash of a secret message."
                }
            ]
        },
        {
            title: "Semaphore groups",
            description:
                "Semaphore groups are binary incremental Merkle trees that store the public identity commitment of each member.",
            linkText: "Create Semaphore groups",
            linkUrl: "https://semaphore.pse.dev/docs/guides/groups",
            codeText: `import { Group } from "@semaphore-protocol/group"

const group = new Group(1)

group.addMember(commitment)`,
            itemList: [
                {
                    icon: <IconTree w="24px" h="24px" color="ceruleanBlue" />,
                    heading: "Merkle trees",
                    body: "Each leaf contains an identity commitment for a user. The identity commitment proves that the user is a group member without revealing the private identity of the user."
                },
                {
                    icon: <IconGroup w="24px" h="24px" color="ceruleanBlue" />,
                    heading: "Types of groups",
                    body: "Groups can be created and managed in a decentralized fashion with Semaphore contracts or off-chain with our JavaScript libraries."
                },
                {
                    icon: <IconManageUsers w="24px" h="24px" color="ceruleanBlue" />,
                    heading: "Group management",
                    body: "Users can join and leave groups by themselves, or an admin can add and remove them. Admins can be centralized authorities, Ethereum accounts, multi-sig wallets or smart contracts."
                }
            ]
        },
        {
            title: "Semaphore proofs",
            description:
                "Semaphore group members can anonymously prove that they are part of a group and that they are generating their own proofs and signals.",
            linkText: "Generate Semaphore proofs",
            linkUrl: "https://semaphore.pse.dev/docs/guides/proofs",
            codeText: `import { generateProof, verifyProof } from "@semaphore-protocol/proof"

const externalNullifier = BigInt(1)
const signal = "Hello world"

const fullProof = await generateProof(identity, group, externalNullifier, signal, {
    zkeyFilePath: "./semaphore.zkey",
    wasmFilePath: "./semaphore.wasm"
})

const verificationKey = JSON.parse(fs.readFileSync("./semaphore.json", "utf-8"))

await verifyProof(verificationKey, fullProof)`,
            itemList: [
                {
                    icon: <IconBadge w="24px" h="24px" color="ceruleanBlue" />,
                    heading: "Membership",
                    body: "Only users who are part of a group can generate a valid proof for that group."
                },
                {
                    icon: <IconFlag w="24px" h="24px" color="ceruleanBlue" />,
                    heading: "Signals",
                    body: "Group users can anonymously broadcast signals such as votes or endorsements without revealing their original identity."
                },
                {
                    icon: <IconCheck w="24px" h="24px" color="ceruleanBlue" />,
                    heading: "Verifiers",
                    body: "Semaphore proofs can be verified with our contracts or off-chain with our JavaScript libraries."
                }
            ]
        }
    ]

    const renderTabBlockSemaphore = () => (
        <VStack>
            <VStack w={{ base: "auto", md: "720px" }}>
                <Text fontSize={{ base: "40px", md: "44px" }} fontWeight={{ base: "400", md: "500" }}>
                    Semaphore: Anonymous interactions
                </Text>
                <Text fontSize={{ base: "16px", md: "20px" }} mt="24px" lineHeight="32px">
                    Using zero knowledge, Semaphore allows users to prove their membership of a group and send signals
                    such as votes or endorsements without revealing their original identity. The goal is to make
                    Semaphore a standard for anonymous signaling and group membership proving.
                </Text>
            </VStack>
            <VStack mt="40px">
                <Flex wrap={{ base: "wrap", lg: "nowrap" }} justify="center" alignItems="center" gap="32px">
                    <VStack>
                        <Text fontSize={{ base: "24px", md: "30px" }} fontWeight={{ base: "400", md: "500" }}>
                            Principles
                        </Text>
                        <InfoCard texts={infoCardTexts[0]} />
                    </VStack>
                    <VStack>
                        <Text fontSize={{ base: "24px", md: "30px" }} fontWeight={{ base: "400", md: "500" }}>
                            Main focus
                        </Text>
                        <InfoCard texts={infoCardTexts[1]} />
                    </VStack>
                </Flex>
            </VStack>
        </VStack>
    )

    const renderTabBlockZeroKnowledge = () => (
        <VStack>
            <VStack w={{ base: "auto", md: "720px" }}>
                <Text fontSize={{ base: "40px", md: "44px" }} fontWeight={{ base: "400", md: "500" }}>
                    Zero Knowledge: new cryptography
                </Text>
                <Text fontSize={{ base: "16px", md: "20px" }} mt="24px" lineHeight="32px">
                    Zero-knowledge is a new field in cryptography that allows developers to build apps that allow users
                    to share information with each other without revealing their identities or the contents of the
                    information being shared.
                </Text>
                <Link href="https://pse.dev/resources" isExternal>
                    <Text
                        borderBottomWidth="1px"
                        borderBottomColor="white"
                        _hover={{ borderBottomColor: "transparent" }}
                        fontSize={{ base: "16px", md: "20px" }}
                        fontWeight="normal"
                    >
                        Learn more
                    </Text>
                </Link>
            </VStack>
            <VStack mt="40px">
                <VStack>
                    <Text fontSize={{ base: "24px", md: "30px" }} fontWeight={{ base: "400", md: "500" }}>
                        Characteristics
                    </Text>
                    <InfoCard texts={infoCardTexts[0]} />
                </VStack>
            </VStack>
        </VStack>
    )

    return (
        <VStack w="full">
            <VStack position="relative">
                <Box
                    display={{ base: "none", md: "block" }}
                    zIndex="-1"
                    left="50%"
                    transform="translateX(-50%)"
                    w="100vw"
                    h="100%"
                    pos="absolute"
                    overflow="hidden"
                >
                    <Image
                        alt="Guy shadow image"
                        src="https://semaphore.cedoor.dev/guy-shadow-horizontal.jpg"
                        objectFit="cover"
                        w="full"
                        h="full"
                    />
                </Box>

                <Box
                    display={{ base: "block", lg: "none" }}
                    zIndex="-1"
                    left="50%"
                    transform="translateX(-50%)"
                    w="100vw"
                    h="100%"
                    pos="absolute"
                    overflow="hidden"
                >
                    <Image
                        alt="Guy shadow image"
                        src="https://semaphore.cedoor.dev/guy-shadow.jpg"
                        objectFit="cover"
                        w="full"
                        h="full"
                    />
                </Box>

                <Tabs
                    maxWidth="100vw"
                    variant="unstyled"
                    align="center"
                    mt={{ base: "100px", md: "170px" }}
                    mb={{ base: "50px", md: "112px" }}
                >
                    <Box overflow="auto" mx="3">
                        <TabList gap="40px" w="max-content" whiteSpace="nowrap">
                            <Tab px={0} fontSize="24px" _selected={{ borderBottom: "2px solid white" }}>
                                About Semaphore
                            </Tab>
                            <Tab px={0} fontSize="24px" _selected={{ borderBottom: "2px solid white" }}>
                                About Zero Knowledge
                            </Tab>
                        </TabList>
                    </Box>
                    <TabPanels mt="80px">
                        <TabPanel>{renderTabBlockSemaphore()}</TabPanel>
                        <TabPanel>{renderTabBlockZeroKnowledge()}</TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>

            <VStack w="full" pt="24" pb="28">
                {sectionBlockTexts.map((sectionBlockText, i) => (
                    <VStack w="full" key={sectionBlockText.title}>
                        <SectionBlock
                            title={sectionBlockText.title}
                            description={sectionBlockText.description}
                            linkText={sectionBlockText.linkText}
                            linkUrl={sectionBlockText.linkUrl}
                            codeText={sectionBlockText.codeText}
                            itemList={sectionBlockText.itemList}
                        />
                        {i !== sectionBlockTexts.length - 1 && <Divider my="68px" borderColor="alabaster.600" />}
                    </VStack>
                ))}
            </VStack>

            <VStack w="full" position="relative">
                <Box
                    backgroundColor="darkBlue"
                    zIndex="-1"
                    left="50%"
                    transform="translateX(-50%)"
                    w="100vw"
                    h="100%"
                    pos="absolute"
                />

                <VStack display={{ base: "none", xl: "block" }} p="100px 40px" w="full" spacing="20">
                    <Carousel
                        title="Videos"
                        sizes={{
                            md: 2,
                            lg: 4
                        }}
                        type="videos"
                    />

                    <Carousel
                        title="Articles"
                        sizes={{
                            md: 2,
                            lg: 4
                        }}
                        type="articles"
                    />
                </VStack>
                <Text
                    display={{ base: "flex", xl: "none" }}
                    flex="1"
                    alignSelf="start"
                    fontSize={{ base: "40px", md: "44px" }}
                    fontWeight="500"
                    mt="100px"
                >
                    Videos
                </Text>
                <Flex display={{ base: "flex", xl: "none" }} w="100%" overflowX="auto">
                    {sortByDate(videos).map((video) => (
                        <VStack key={video.url}>
                            <Box px="3">
                                <VideoCard title={video.title} thumbnail={video.thumbnail} url={video.url} />
                            </Box>
                        </VStack>
                    ))}
                </Flex>
                <Text
                    display={{ base: "flex", xl: "none" }}
                    flex="1"
                    alignSelf="start"
                    fontSize="44px"
                    fontWeight="500"
                    mt="96px"
                >
                    Articles
                </Text>
                <Flex display={{ base: "flex", xl: "none" }} w="100%" overflowX="auto" mb="66px">
                    {sortByDate(articles).map((article) => (
                        <VStack key={article.url}>
                            <ArticleCard title={article.title} minRead={article.minRead} url={article.url} />
                        </VStack>
                    ))}
                </Flex>
            </VStack>
        </VStack>
    )
}
