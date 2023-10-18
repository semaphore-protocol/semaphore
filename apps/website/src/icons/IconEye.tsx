import { Icon } from "@chakra-ui/react"
import React from "react"

export type IconEyeProps = {
    width?: number
    height?: number
    color?: string
}

export default function IconEye({ width, height, color }: IconEyeProps): JSX.Element {
    return (
        <Icon viewBox="0 0 111 110" width={width} height={height} color={color}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M65.3716 55.2448C65.3716 60.7237 60.93 65.1653 55.4511 65.1653C49.9721 65.1653 45.5305 60.7237 45.5305 55.2448C45.5305 49.7658 49.9721 45.3242 55.4511 45.3242C60.93 45.3242 65.3716 49.7658 65.3716 55.2448ZM60.4114 55.2448C60.4114 57.9843 58.1906 60.2051 55.4511 60.2051C52.7115 60.2051 50.4908 57.9843 50.4908 55.2448C50.4908 52.5052 52.7115 50.2845 55.4511 50.2845C58.1906 50.2845 60.4114 52.5052 60.4114 55.2448Z"
                fill="currentColor"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M55.4515 32.9219C69.3192 32.9219 80.9716 42.4067 84.2754 55.2431C80.9716 68.0796 69.3192 77.5644 55.4515 77.5644C41.5837 77.5644 29.9313 68.0796 26.6274 55.2431C29.9313 42.4067 41.5837 32.9219 55.4515 32.9219ZM55.4515 72.6041C44.3515 72.6041 34.944 65.3078 31.7841 55.2431C34.944 45.1784 44.3515 37.8822 55.4515 37.8822C66.5516 37.8822 75.959 45.1784 79.119 55.2431C75.959 65.3078 66.5516 72.6041 55.4515 72.6041Z"
                fill="currentColor"
            />
        </Icon>
    )
}
