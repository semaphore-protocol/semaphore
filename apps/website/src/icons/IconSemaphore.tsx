import { Icon } from "@chakra-ui/react"
import React from "react"

export type IconSemaphoreProps = {
    width?: number
    height?: number
    color?: string
}

export default function IconSemaphore({ width, height, color }: IconSemaphoreProps): JSX.Element {
    return (
        <Icon viewBox="0 0 20 40" width={width} height={height} color={color}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M19.9239 0H19.3595C8.66769 0 0 8.68848 0 19.406V19.9999H9.96197L19.9239 10.0954V0ZM18.2705 1.6939V9.40519L9.28173 18.3425H1.68653C1.94142 14.0024 3.74877 9.95766 6.84047 6.85854C9.92721 3.7644 13.9507 1.95437 18.2705 1.6939Z"
                fill="currentColor"
            />
            <path
                d="M19.9256 20.0001H9.96362L0 29.9046V40H0.56604C11.2579 40 19.9256 31.3115 19.9256 20.594V20.0001Z"
                fill="currentColor"
            />
        </Icon>
    )
}
