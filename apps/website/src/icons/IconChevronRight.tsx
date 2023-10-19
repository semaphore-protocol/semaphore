import { Icon } from "@chakra-ui/react"
import React from "react"

export type IconChevronRightProps = {
    width?: number
    height?: number
    color?: string
}

export default function IconChevronRight({ width, height, color }: IconChevronRightProps): JSX.Element {
    return (
        <Icon viewBox="0 0 6 9" width={width} height={height} color={color}>
            <path d="M2.829 4.243L0 1.415L1.414 0L5.657 4.243L1.414 8.486L0 7.071L2.829 4.243Z" fill="currentColor" />
        </Icon>
    )
}
