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
    TabIndicator,
    Divider
} from "@chakra-ui/react"
import Image from "next/image"
import InfoCard, { InfoBlock } from "../../components/InfoCard"
import SectionBlock, { SectionBlockProps } from "../../components/SectionBlock"
import MediaCarousel from "../../components/VideosCarousel"
import IconEyelash from "@/icons/IconEyelash"
import IconEye from "@/icons/IconEye"
import IconUser from "@/icons/IconUser"
import IconTree from "@/icons/IconTree"
import IconManageUsers from "@/icons/IconManageUsers"
import IconGroup from "@/icons/IconGroup"
import IconBadge from "@/icons/IconBadge"
import IconCheck from "@/icons/IconCheck"
import IconFlag from "@/icons/IconFlag"
import ArticlesCarousel from "@/components/ArticlesCarousel"

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
                    icon: <IconEyelash w={"24px"} h={"24px"} color={"ceruleanBlue"} />,
                    heading: "Private values",
                    body: "Trapdoor and nullifier values are the private values of the Semaphore identity. To avoid fraud, the owner must keep both values secret."
                },
                {
                    icon: <IconEye w={"24px"} h={"24px"} color={"ceruleanBlue"} />,
                    heading: "Private values",
                    body: "Trapdoor and nullifier values are the private values of the Semaphore identity. To avoid fraud, the owner must keep both values secret."
                },
                {
                    icon: <IconUser w={"24px"} h={"24px"} color={"ceruleanBlue"} />,
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

const group = new Group()
            
group.addMember(commitment)`,
            itemList: [
                {
                    icon: <IconTree w={"24px"} h={"24px"} color={"ceruleanBlue"} />,
                    heading: "Merkle trees",
                    body: "Each leaf contains an identity commitment for a user. The identity commitment proves that the user is a group member without revealing the private identity of the user."
                },
                {
                    icon: <IconGroup w={"24px"} h={"24px"} color={"ceruleanBlue"} />,
                    heading: "Types of groups",
                    body: "Groups can be created and managed in a decentralized fashion with Semaphore contracts or off-chain with our JavaScript libraries."
                },
                {
                    icon: <IconManageUsers w={"24px"} h={"24px"} color={"ceruleanBlue"} />,
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
                    icon: <IconBadge w={"24px"} h={"24px"} color={"ceruleanBlue"} />,
                    heading: "Membership",
                    body: "Only users who are part of a group can generate a valid proof for that group."
                },
                {
                    icon: <IconFlag w={"24px"} h={"24px"} color={"ceruleanBlue"} />,
                    heading: "Signals",
                    body: "Group users can anonymously broadcast signals such as votes or endorsements without revealing their original identity."
                },
                {
                    icon: <IconCheck w={"24px"} h={"24px"} color={"ceruleanBlue"} />,
                    heading: "Verifiers",
                    body: "Semaphore proofs can be verified with our contracts or off-chain with our JavaScript libraries."
                }
            ]
        }
    ]

    const renderTabBlockSemaphore = () => (
        <VStack>
            <VStack w={"720px"}>
                <Text fontSize={"44px"} fontWeight={"500"}>
                    Semaphore: Anonymous interactions
                </Text>
                <Text fontSize={"20px"} mt={"24px"} lineHeight={"32px"}>
                    Using zero knowledge, Semaphore allows users to prove their membership of a group and send signals
                    such as votes or endorsements without revealing their original identity. The goal is to make
                    Semaphore a standard for anonymous signaling and group membership proving.
                </Text>
            </VStack>
            <VStack mt={"40px"}>
                <Flex gap={"32px"}>
                    <VStack>
                        <Text fontSize={"30px"} fontWeight={"500"}>
                            Principles
                        </Text>
                        <InfoCard texts={infoCardTexts[0]} />
                    </VStack>
                    <VStack>
                        <Text fontSize={"30px"} fontWeight={"500"}>
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
            <VStack w={"720px"}>
                <Text fontSize={"44px"} fontWeight={"500"}>
                    Zero Knowledge: new cryptography
                </Text>
                <Text fontSize={"20px"} mt={"24px"} lineHeight={"32px"}>
                    Zero-knowledge is a new field in cryptography that allows developers to build apps that allow users
                    to share information with each other without revealing their identities or the contents of the
                    information being shared.
                </Text>
                <Link href="https://pse.dev/resources" isExternal>
                    <Text
                        borderBottomWidth={"1px"}
                        borderBottomColor={"white"}
                        _hover={{ borderBottomColor: "transparent" }}
                        fontSize="20px"
                        fontWeight="normal"
                    >
                        Learn more
                    </Text>
                </Link>
            </VStack>
            <VStack mt={"40px"}>
                <VStack>
                    <Text fontSize={"30px"} fontWeight={"500"}>
                        Characteristics
                    </Text>
                    <InfoCard texts={infoCardTexts[0]} />
                </VStack>
            </VStack>
        </VStack>
    )

    return (
        <VStack>
            <VStack h="1187px">
                <Image
                    src="https://semaphore.cedoor.dev/guy-shadow-horizontal.png"
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "auto", height: "1187px", zIndex: "-1", position: "absolute" }}
                    alt="Shadow of a person"
                />
                <Tabs position="relative" variant="unstyled" align={"center"} mt={"170px"}>
                    <TabList gap={"40px"}>
                        <Tab px={0} fontSize={"24px"}>
                            About Semaphore
                        </Tab>
                        <Tab px={0} fontSize={"24px"}>
                            About Zero Knowledge
                        </Tab>
                    </TabList>
                    <TabIndicator mt="-1.5px" height="2px" bg="white" borderRadius="1px" />
                    <TabPanels mt={"80px"}>
                        <TabPanel>{renderTabBlockSemaphore()}</TabPanel>
                        <TabPanel>{renderTabBlockZeroKnowledge()}</TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
            <VStack p={"128px 80px"}>
                {sectionBlockTexts.map((sectionBlockText, i) => (
                    <VStack key={i}>
                        <SectionBlock
                            title={sectionBlockText.title}
                            description={sectionBlockText.description}
                            linkText={sectionBlockText.linkText}
                            linkUrl={sectionBlockText.linkUrl}
                            codeText={sectionBlockText.codeText}
                            itemList={sectionBlockText.itemList}
                        />
                        {i !== sectionBlockTexts.length - 1 && <Divider my={"68px"} borderColor={"alabaster.600"} />}
                    </VStack>
                ))}
            </VStack>

            <VStack backgroundColor={"darkBlue"}>
                <VStack mt={"128px"} w="full">
                    <MediaCarousel />
                </VStack>

                <VStack mt={"96px"} mb={"66px"} w={"full"}>
                    <ArticlesCarousel />
                </VStack>
            </VStack>
        </VStack>
    )
}
