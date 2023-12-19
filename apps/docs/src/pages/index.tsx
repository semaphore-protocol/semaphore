import { translate } from "@docusaurus/Translate"
import CodeBlock from "@theme/CodeBlock"
import Layout from "@theme/Layout"
import React from "react"
import IconAwards from "../components/icons/IconAwards"
import IconCheck from "../components/icons/IconCheck"
import IconConnections from "../components/icons/IconConnections"
import IconEye from "../components/icons/IconEye"
import IconEyeClose from "../components/icons/IconEyeClose"
import IconFlag from "../components/icons/IconFlag"
import IconGroup from "../components/icons/IconGroup"
import IconProfile from "../components/icons/IconProfile"
import IconUnion from "../components/icons/IconUnion"
import IllustrationHero from "../components/IllustrationHero"
import LinkButton from "../components/LinkButton"
import OutlineLinkButton from "../components/OutlineLinkButton"
import styles from "./styles.module.scss"

export default function Home() {
    return (
        <Layout
            title="Semaphore Protocol"
            description="A zero-knowledge protocol for anonymous signalling on Ethereum."
        >
            <div className={styles.container}>
                <div className={styles.jumbotron}>
                    <div>
                        <h1>
                            {translate({
                                id: "jumbotron.title"
                            })}
                        </h1>

                        <p>
                            {translate({
                                id: "jumbotron.description"
                            })}
                        </p>

                        <div>
                            <LinkButton href="./docs/quick-setup">
                                {translate({
                                    id: "quick-setup.button"
                                })}
                            </LinkButton>

                            <LinkButton href="https://github.com/semaphore-protocol/boilerplate">
                                {translate({
                                    id: "boilerplate.button"
                                })}
                            </LinkButton>
                        </div>
                    </div>

                    <IllustrationHero />
                </div>

                <div className={styles.components}>
                    <h3>
                        {translate({
                            id: "components.description"
                        })}
                    </h3>
                    <div>
                        <OutlineLinkButton href="https://github.com/semaphore-protocol/semaphore/tree/main/packages/contracts">
                            {translate({
                                id: "components.button.solidity"
                            })}
                        </OutlineLinkButton>
                        <OutlineLinkButton href="https://github.com/semaphore-protocol/semaphore/tree/main/packages/circuits">
                            {translate({
                                id: "components.button.circuits"
                            })}
                        </OutlineLinkButton>
                        <OutlineLinkButton href="https://github.com/semaphore-protocol/semaphore#-packages">
                            {translate({
                                id: "components.button.libraries"
                            })}
                        </OutlineLinkButton>
                    </div>
                </div>

                <div className={styles.section}>
                    <div>
                        <div>
                            <h2>
                                {translate({
                                    id: "section.identities.title"
                                })}
                            </h2>

                            <p>
                                {translate({
                                    id: "section.identities.description"
                                })}
                            </p>

                            <LinkButton href="/docs/guides/identities">
                                {translate({
                                    id: "section.identities.link"
                                })}
                            </LinkButton>
                        </div>
                        <div>
                            <CodeBlock language="ts">
                                {`import { Identity } from "@semaphore-protocol/identity"

const { trapdoor, nullifier, commitment } = new Identity()`}
                            </CodeBlock>
                        </div>
                    </div>
                    <div>
                        <div>
                            <IconEyeClose />
                            <h3>
                                {translate({
                                    id: "section.identities.box1.title"
                                })}
                            </h3>
                            <p>
                                {translate({
                                    id: "section.identities.box1.description"
                                })}
                            </p>
                        </div>
                        <div>
                            <IconEye />
                            <h3>
                                {translate({
                                    id: "section.identities.box2.title"
                                })}
                            </h3>
                            <p>
                                {translate({
                                    id: "section.identities.box2.description"
                                })}
                            </p>
                        </div>
                        <div>
                            <IconProfile />

                            <h3>
                                {translate({
                                    id: "section.identities.box3.title"
                                })}
                            </h3>
                            <p>
                                {translate({
                                    id: "section.identities.box3.description"
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.divider} />

                <div className={styles.section}>
                    <div>
                        <div>
                            <h2>
                                {translate({
                                    id: "section.groups.title"
                                })}
                            </h2>

                            <p>
                                {translate({
                                    id: "section.groups.description"
                                })}
                            </p>

                            <LinkButton href="/docs/guides/groups">
                                {translate({
                                    id: "section.groups.link"
                                })}
                            </LinkButton>
                        </div>
                        <div>
                            <CodeBlock language="ts">
                                {`import { Group } from "@semaphore-protocol/group"

const group = new Group()

group.addMember(commitment)`}
                            </CodeBlock>
                        </div>
                    </div>
                    <div>
                        <div>
                            <IconConnections />
                            <h3>
                                {translate({
                                    id: "section.groups.box1.title"
                                })}
                            </h3>
                            <p>
                                {translate({
                                    id: "section.groups.box1.description"
                                })}
                            </p>
                        </div>
                        <div>
                            <IconGroup />
                            <h3>
                                {translate({
                                    id: "section.groups.box2.title"
                                })}
                            </h3>
                            <p>
                                {translate({
                                    id: "section.groups.box2.description"
                                })}
                            </p>
                        </div>
                        <div>
                            <IconUnion />

                            <h3>
                                {translate({
                                    id: "section.groups.box3.title"
                                })}
                            </h3>
                            <p>
                                {translate({
                                    id: "section.groups.box3.description"
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.divider} />

                <div className={styles.section}>
                    <div>
                        <div>
                            <h2>
                                {translate({
                                    id: "section.proofs.title"
                                })}
                            </h2>

                            <p>
                                {translate({
                                    id: "section.proofs.description"
                                })}
                            </p>

                            <LinkButton href="/docs/guides/proofs">
                                {translate({
                                    id: "section.proofs.link"
                                })}
                            </LinkButton>
                        </div>
                        <div>
                            <CodeBlock language="ts">
                                {`import { generateProof, verifyProof } from "@semaphore-protocol/proof"
import { formatBytes32String } from "@ethersproject/strings"

const externalNullifier = formatBytes32String("Topic")
const signal = formatBytes32String("Hello world")

const fullProof = await generateProof(identity, group, externalNullifier, signal, {
    zkeyFilePath: "./semaphore.zkey",
    wasmFilePath: "./semaphore.wasm"
})

await verifyProof(fullProof, group.depth)`}
                            </CodeBlock>
                        </div>
                    </div>
                    <div>
                        <div>
                            <IconAwards />
                            <h3>
                                {translate({
                                    id: "section.proofs.box1.title"
                                })}
                            </h3>
                            <p>
                                {translate({
                                    id: "section.proofs.box1.description"
                                })}
                            </p>
                        </div>
                        <div>
                            <IconFlag />
                            <h3>
                                {translate({
                                    id: "section.proofs.box2.title"
                                })}
                            </h3>
                            <p>
                                {translate({
                                    id: "section.proofs.box2.description"
                                })}
                            </p>
                        </div>
                        <div>
                            <IconCheck />
                            <h3>
                                {translate({
                                    id: "section.proofs.box3.title"
                                })}
                            </h3>
                            <p>
                                {translate({
                                    id: "section.proofs.box3.description"
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
