import { Icon } from "@chakra-ui/react"
import React from "react"

export type IconChevronRightProps = {
    width?: number
    height?: number
    color?: string
}

export default function IconChevronRight({ width, height, color }: IconChevronRightProps): JSX.Element {
    return (
        <Icon width={width} height={height} color={color}>
            <path
                fill="currentColor"
                d="M10.5859 6.34317L12.0001 4.92896L19.0712 12L12.0001 19.0711L10.5859 17.6569L16.2428 12L10.5859 6.34317Z"
            />
        </Icon>
    )
}
