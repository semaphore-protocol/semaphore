import { Icon, IconProps } from "@chakra-ui/react"
import React from "react"

export default function IconMenu(props: IconProps): JSX.Element {
    return (
        <Icon viewBox="0 0 24 24" {...props}>
            <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" fill="currentColor" />
        </Icon>
    )
}
