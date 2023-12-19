import React from "react"

export type IconArrowTopRightProps = {
    width?: number
    height?: number
}

export default function IconArrowTopRight({ width = 13, height = 13 }: IconArrowTopRightProps): JSX.Element {
    return (
        <svg
            className="custom-icon"
            width={width}
            height={height}
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M5.85868 0.495117L5.85398 2.49512L10.4116 2.50578L0.808105 12.09L2.2209 13.5056L11.8507 3.89516L11.8399 8.50917L13.8399 8.51377L13.8587 0.513817L5.85868 0.495117Z" />
        </svg>
    )
}
