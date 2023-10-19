import { Icon } from "@chakra-ui/react"
import React from "react"

export type IconArrowUpRightProps = {
    width?: number
    height?: number
    color?: string
}

export default function IconArrowUpRight({ width, height, color }: IconArrowUpRightProps): JSX.Element {
    return (
        <Icon viewBox="00 0 10 11" width={width} height={height} color={color}>
            <path
                d="M3.8934 0.621094L3.88987 2.12109L7.30807 2.12909L0.105469 9.31723L1.16506 10.3789L8.3874 3.17112L8.3793 6.63163L9.8793 6.63508L9.8934 0.635119L3.8934 0.621094Z"
                fill="currentColor"
            />
        </Icon>
    )
}
