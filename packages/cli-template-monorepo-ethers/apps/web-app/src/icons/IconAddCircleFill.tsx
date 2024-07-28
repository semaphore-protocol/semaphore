import { Icon } from "@chakra-ui/react"
import React from "react"

export type IconAddCircleFillProps = {
    width?: number
    height?: number
    color?: string
}

export default function IconAddCircleFill({ width, height, color }: IconAddCircleFillProps): JSX.Element {
    return (
        <Icon width={width} height={height} color={color}>
            <path
                fill="currentColor"
                d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM11 11H7V13H11V17H13V13H17V11H13V7H11V11Z"
            />
        </Icon>
    )
}
