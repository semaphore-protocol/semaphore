import React from "react"

export type IconEyeProps = {
    width?: number
    height?: number
}

export default function IconEye({ width = 24, height = 24 }: IconEyeProps): JSX.Element {
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
                d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12ZM14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.9999 3C17.5914 3 22.2897 6.82432 23.6218 12C22.2897 17.1757 17.5914 21 11.9999 21C6.40836 21 1.71006 17.1757 0.37793 12C1.71006 6.82432 6.40836 3 11.9999 3ZM11.9999 19C7.52431 19 3.7312 16.0581 2.45711 12C3.7312 7.94186 7.52431 5 11.9999 5C16.4755 5 20.2686 7.94186 21.5427 12C20.2686 16.0581 16.4755 19 11.9999 19Z"
            />
        </svg>
    )
}
