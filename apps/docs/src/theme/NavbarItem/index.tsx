import { useLocation } from "@docusaurus/router"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import OriginalNavBarItem from "@theme-original/NavbarItem"
import React from "react"

export default function NavbarItem(props: any) {
    const { pathname } = useLocation()
    const { i18n } = useDocusaurusContext()

    const pathSegments = pathname.split("/")

    let version: string

    if (i18n.locales.includes(pathSegments[1])) {
        ;[, , version] = pathSegments
    } else {
        ;[, version] = pathSegments
    }

    const { className = "" } = props

    return (
        (!className ||
            !(
                (className.includes("V1") && version !== "V1") ||
                (className.includes("V2") && version !== "V2") ||
                (className.includes("V3") && version !== "V3") ||
                (className.includes("V4-alpha") && version !== "V4-alpha")
            )) && <OriginalNavBarItem {...props} />
    )
}
