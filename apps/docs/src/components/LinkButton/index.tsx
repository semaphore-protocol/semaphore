import Link from "@docusaurus/Link"
import React from "react"
import IconArrowRight from "../icons/IconArrowRight"
import styles from "./styles.module.scss"

export type LinkButtonProps = {
    href: string
    children: string
}

export default function LinkButton({ href, children }: LinkButtonProps): JSX.Element {
    return (
        <Link className={styles.linkButton} href={href} target="_blank">
            <div className={styles.buttonText}>{children}</div>
            <div className={styles.buttonIcon}>
                <IconArrowRight />
            </div>
        </Link>
    )
}
