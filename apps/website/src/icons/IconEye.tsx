import { Icon, IconProps } from "@chakra-ui/react"
import React from "react"

export default function IconEye(props: IconProps): JSX.Element {
    return (
        <Icon viewBox="0 0 24 18" {...props}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16 9C16 11.2091 14.2091 13 12 13C9.79086 13 8 11.2091 8 9C8 6.79086 9.79086 5 12 5C14.2091 5 16 6.79086 16 9ZM14 9C14 10.1046 13.1046 11 12 11C10.8954 11 10 10.1046 10 9C10 7.8954 10.8954 7 12 7C13.1046 7 14 7.8954 14 9Z"
                fill="currentColor"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.9999 0C17.5914 0 22.2897 3.82432 23.6218 9C22.2897 14.1757 17.5914 18 11.9999 18C6.40836 18 1.71006 14.1757 0.37793 9C1.71006 3.82432 6.40836 0 11.9999 0ZM11.9999 16C7.52431 16 3.7312 13.0581 2.45711 9C3.7312 4.94186 7.52431 2 11.9999 2C16.4755 2 20.2686 4.94186 21.5427 9C20.2686 13.0581 16.4755 16 11.9999 16Z"
                fill="currentColor"
            />
        </Icon>
    )
}
