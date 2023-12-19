import React from "react"

export type IconCheckProps = {
    width?: number
    height?: number
}

export default function IconCheck({ width = 24, height = 24 }: IconCheckProps): JSX.Element {
    return (
        <svg
            className="custom-icon"
            width={width}
            height={width}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M10.2427 13.6568L7.41421 10.8284L6 12.2426L10.2427 16.4853L17.3137 9.41421L15.8995 8L10.2427 13.6568Z" />
            <circle cx="12" cy="12" r="11.15" strokeWidth="1.7" />
        </svg>
    )
}
