import { useLocation } from "@docusaurus/router"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import OriginalNavBarItem from "@theme-original/NavbarItem"
import React from "react"

export default function NavbarItem(props) {
    const { pathname } = useLocation()
    const { i18n } = useDocusaurusContext()

    const pathSegments = pathname.split("/")

    let docs: string, version: string

    if (i18n.locales.includes(pathSegments[1])) {
        docs = pathSegments[2]
        version = pathSegments[3]
    } else {
        docs = pathSegments[1]
        version = pathSegments[2]
    }

    let { className = "" } = props

    return (
        (!className ||
            !(
                (className.includes("V1") && version !== "V1") ||
                (className.includes("V2") && version !== "V2") ||
                (className.includes("V3") && version !== "V3") ||
                (className.includes("homepage") && docs === "docs")
            )) && <OriginalNavBarItem {...props} />
    )
}
