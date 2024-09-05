import { Icon, IconProps } from "@chakra-ui/react"
import React from "react"

export default function IconCheck(props: IconProps): JSX.Element {
    return (
        <Icon viewBox="0 0 24 24" {...props}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM7.79636 10.9259L10.3891 13.5186L15.5745 8.33315L16.8709 9.62951L10.3891 16.1114L6.5 12.2222L7.79636 10.9259Z"
                fill="currentColor"
            />
        </Icon>
    )
}
