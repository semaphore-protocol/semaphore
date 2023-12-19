import React from "react"

export type IconFlagProps = {
    width?: number
    height?: number
}

export default function IconFlag({ width = 24, height = 24 }: IconFlagProps): JSX.Element {
    return (
        <svg
            className="custom-icon"
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4 21H6V11H12V13H20V5H13V3H4V21ZM12 5H6V9H13V11H18V7H12V5Z"
            />
        </svg>
    )
}
