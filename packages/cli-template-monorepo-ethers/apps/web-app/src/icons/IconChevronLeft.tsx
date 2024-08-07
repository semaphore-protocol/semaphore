import { Icon } from "@chakra-ui/react"
import React from "react"

export type IconChevronLeftProps = {
    width?: number
    height?: number
    color?: string
}

export default function IconChevronLeft({ width, height, color }: IconChevronLeftProps): JSX.Element {
    return (
        <Icon width={width} height={height} color={color}>
            <path
                fill="currentColor"
                d="M16.2425 6.34317L14.8283 4.92896L7.75732 12L14.8284 19.0711L16.2426 17.6569L10.5857 12L16.2425 6.34317Z"
            />
        </Icon>
    )
}
