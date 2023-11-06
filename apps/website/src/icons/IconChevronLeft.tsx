import { Icon, IconProps } from "@chakra-ui/react"
import React from "react"

export default function IconChevronLeft(props: IconProps): JSX.Element {
    return (
        <Icon viewBox="0 0 8 14" {...props}>
            <path
                d="M2.828 6.99999L7.778 11.95L6.364 13.364L0 6.99999L6.364 0.635986L7.778 2.04999L2.828 6.99999Z"
                fill="currentColor"
            />
        </Icon>
    )
}
