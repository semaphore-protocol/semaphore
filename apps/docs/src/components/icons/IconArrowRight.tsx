import React from "react"

export type IconArrowRightProps = {
    width?: number
    height?: number
}

export default function IconArrowRight({ width = 10, height = 15 }: IconArrowRightProps): JSX.Element {
    return (
        <svg
            className="custom-icon"
            width={width}
            height={height}
            viewBox="0 0 10 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M0.585938 1.46206L2.00014 0.0478516L9.07124 7.11889L2.00014 14.19L0.585938 12.7758L6.24284 7.11889L0.585938 1.46206Z" />
        </svg>
    )
}
