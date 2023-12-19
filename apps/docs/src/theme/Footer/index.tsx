import Link from "@docusaurus/Link"
import { translate } from "@docusaurus/Translate"
import Logo from "@theme/Logo"
import clsx from "clsx"
import React from "react"
import styles from "./styles.module.scss"

function Footer() {
    return (
        <footer className={clsx("footer")}>
            <div className={clsx("container container-fluid", styles.container)}>
                <div>
                    <div>
                        <h3>
                            {translate({
                                id: "footer.left.title"
                            })}
                        </h3>
                        <p>
                            {translate({
                                id: "footer.left.description"
                            })}
                        </p>
                        <Link href="https://pse.dev" target="_blank">
                            pse.dev
                        </Link>
                    </div>
                    <div>
                        <div>
                            <h3>
                                {translate({
                                    id: "footer.right.usedby.title"
                                })}
                            </h3>
                            <Link href="https://github.com/Unirep" target="_blank">
                                {translate({
                                    id: "footer.right.usedby.link1"
                                })}
                            </Link>
                            <Link href="https://interep.link/" target="_blank">
                                {translate({
                                    id: "footer.right.usedby.link2"
                                })}
                            </Link>
                        </div>
                        <div>
                            <h3>
                                {translate({
                                    id: "footer.right.learn.title"
                                })}
                            </h3>

                            <Link href="https://semaphore.pse.dev/github" target="_blank">
                                {translate({
                                    id: "footer.right.learn.link1"
                                })}
                            </Link>
                            <Link href="/docs/introduction" target="_blank">
                                {translate({
                                    id: "footer.right.learn.link2"
                                })}
                            </Link>
                        </div>
                        <div>
                            <h3>
                                {translate({
                                    id: "footer.right.connect.title"
                                })}
                            </h3>
                            <Link href="https://semaphore.pse.dev/discord" target="_blank">
                                {translate({
                                    id: "footer.right.connect.link1"
                                })}
                            </Link>
                            <Link href="https://twitter.com/PrivacyScaling" target="_blank">
                                {translate({
                                    id: "footer.right.connect.link2"
                                })}
                            </Link>
                        </div>
                    </div>
                </div>

                <hr />

                <div>
                    <p>
                        {translate({
                            id: "footer.copyright"
                        })}
                    </p>

                    <Logo
                        style={{ marginRight: -8 }}
                        className="navbar__brand"
                        imageClassName="navbar__logo"
                        titleClassName="navbar__title text--truncate"
                    />
                </div>
            </div>
        </footer>
    )
}

export default React.memo(Footer)
