import { Icon } from "@chakra-ui/react"
import React from "react"

export type IconCheckProps = {
    width?: number
    height?: number
    color?: string
}

export default function IconCheck({ width, height, color }: IconCheckProps): JSX.Element {
    return (
        <Icon width={width} height={height} color={color}>
            <path
                fill="currentColor"
                d="M10.5859 13.4142L7.75747 10.5858L6.34326 12L10.5859 16.2427L17.6569 9.1716L16.2427 7.75739L10.5859 13.4142Z"
            />
        </Icon>
    )
}
