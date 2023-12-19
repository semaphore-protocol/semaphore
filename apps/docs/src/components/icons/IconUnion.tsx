import React from "react"

export type IconUnionProps = {
    width?: number
    height?: number
}

export default function IconUnion({ width = 20, height = 18 }: IconUnionProps): JSX.Element {
    return (
        <svg
            className="custom-icon"
            width={width}
            height={height}
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10 4C10 6.20914 8.2091 8 6 8C3.79086 8 2 6.20914 2 4C2 1.79086 3.79086 0 6 0C8.2091 0 10 1.79086 10 4ZM8 4C8 5.10457 7.10457 6 6 6C4.89543 6 4 5.10457 4 4C4 2.89543 4.89543 2 6 2C7.10457 2 8 2.89543 8 4ZM10 12C10 11.4477 9.5523 11 9 11H3C2.44772 11 2 11.4477 2 12V18H0V12C0 10.3431 1.34315 9 3 9H9C10.6569 9 12 10.3431 12 12V18H10V12ZM16 4H18V6H20V8H18V10H16V8H14V6H16V4ZM18 13H16H14V15H16H18H20V13H18Z"
            />
        </svg>
    )
}
