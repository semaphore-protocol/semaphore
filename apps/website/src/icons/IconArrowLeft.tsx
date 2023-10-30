import { Icon, IconProps } from "@chakra-ui/react"
import React from "react"

export default function IconArrowLeft(props: IconProps): JSX.Element {
    return (
        <Icon viewBox="0 0 16 16" {...props}>
            <path
                d="M3.828 7.00005H16V9.00005H3.828L9.192 14.364L7.778 15.778L0 8.00005L7.778 0.222046L9.192 1.63605L3.828 7.00005Z"
                fill="currentColor"
            />
        </Icon>
    )
}
