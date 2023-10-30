import { Icon, IconProps } from "@chakra-ui/react"
import React from "react"

export default function IconArrowRight(props: IconProps): JSX.Element {
    return (
        <Icon viewBox="0 0 16 16" {...props}>
            <path
                d="M12.172 7.00005L6.808 1.63605L8.222 0.222046L16 8.00005L8.222 15.778L6.808 14.364L12.172 9.00005H0V7.00005H12.172Z"
                fill="currentColor"
            />
        </Icon>
    )
}
