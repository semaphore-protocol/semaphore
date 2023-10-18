import { Icon } from "@chakra-ui/react"
import React from "react"

export type IconCliProps = {
    width?: number
    height?: number
    color?: string
}

export default function IconCli({ width, height, color }: IconCliProps): JSX.Element {
    return (
        <Icon viewBox="0 0 66 58" width={width} height={height} color={color}>
            <path
                d="M30.3189 25.6833L5.21206 50.7902L0.191406 45.7695L20.2776 25.6833L0.191406 5.59718L5.21206 0.580078L30.3189 25.6833ZM30.3189 50.5381H65.8256V57.6394H30.3189V50.5381Z"
                fill="currentColor"
            />
        </Icon>
    )
}
