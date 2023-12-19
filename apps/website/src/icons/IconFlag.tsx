import { Icon, IconProps } from "@chakra-ui/react"
import React from "react"

export default function IconFlag(props: IconProps): JSX.Element {
    return (
        <Icon viewBox="0 0 18 22" {...props}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 21.125H2.25V9.875H9V12.125H18V3.125H10.125V0.875H0V21.125ZM9 3.125H2.25V7.625H10.125V9.875H15.75V5.375H9V3.125Z"
                fill="currentColor"
            />
        </Icon>
    )
}
