import { Icon, IconProps } from "@chakra-ui/react"
import React from "react"

export default function IconInnerCheck(props: IconProps): JSX.Element {
    return (
        <Icon viewBox="0 0 9 7" {...props}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.84114 1.12297C8.23166 1.5135 8.23166 2.14666 7.84114 2.53718L3.84114 6.53718C3.45062 6.92771 2.81745 6.92771 2.42693 6.53718L0.426926 4.53718C0.0364021 4.14666 0.0364021 3.5135 0.426926 3.12297C0.817451 2.73245 1.45062 2.73245 1.84114 3.12297L3.13403 4.41586L6.42693 1.12297C6.81745 0.732447 7.45062 0.732447 7.84114 1.12297Z"
                fill="white"
            />
        </Icon>
    )
}
