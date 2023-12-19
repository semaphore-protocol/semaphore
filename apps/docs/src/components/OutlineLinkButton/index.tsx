import Link from "@docusaurus/Link"
import React from "react"
import IconArrowTopRight from "../icons/IconArrowTopRight"
import styles from "./styles.module.scss"

export type OutlineLinkButtonProps = {
    href: string
    children: string
}

export default function OutlineLinkButton({ href, children }: OutlineLinkButtonProps): JSX.Element {
    return (
        <Link className={styles.outlineLinkButton} href={href} target="_blank">
            <div>{children}</div>
            <div className={styles.buttonIcon}>
                <IconArrowTopRight />
            </div>
        </Link>
    )
}
