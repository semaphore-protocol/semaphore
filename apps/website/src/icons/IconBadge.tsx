import { Icon, IconProps } from "@chakra-ui/react"
import React from "react"

export default function IconBadge(props: IconProps): JSX.Element {
    return (
        <Icon viewBox="0 0 14 20" {...props}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14 7C14 9.3787 12.8135 11.4804 11 12.7453V20H8.4142L7 18.5858L5.5858 20H3V12.7453C1.18652 11.4804 0 9.3787 0 7C0 3.13401 3.13401 0 7 0C10.866 0 14 3.13401 14 7ZM12 7C12 9.7614 9.7614 12 7 12C4.23858 12 2 9.7614 2 7C2 4.23858 4.23858 2 7 2C9.7614 2 12 4.23858 12 7ZM5 17.7573L7 15.7573L9 17.7574V13.7101C8.3663 13.8987 7.695 14 7 14C6.305 14 5.6337 13.8987 5 13.7101V17.7573Z"
                fill="currentColor"
            />
        </Icon>
    )
}
