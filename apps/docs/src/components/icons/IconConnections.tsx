import React from "react"

export type IconConnectionsProps = {
    width?: number
    height?: number
}

export default function IconConnections({ width = 18, height = 22 }: IconConnectionsProps): JSX.Element {
    return (
        <svg
            className="custom-icon"
            width={width}
            height={height}
            viewBox="0 0 18 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M7 0C7.552 0 8 0.4928 8 1.1V5.5C8 6.1072 7.552 6.6 7 6.6H5V8.8H10V7.7C10 7.0928 10.448 6.6 11 6.6H17C17.552 6.6 18 7.0928 18 7.7V12.1C18 12.7072 17.552 13.2 17 13.2H11C10.448 13.2 10 12.7072 10 12.1V11H5V17.6H10V16.5C10 15.8928 10.448 15.4 11 15.4H17C17.552 15.4 18 15.8928 18 16.5V20.9C18 21.5072 17.552 22 17 22H11C10.448 22 10 21.5072 10 20.9V19.8H4C3.448 19.8 3 19.3072 3 18.7V6.6H1C0.448 6.6 0 6.1072 0 5.5V1.1C0 0.4928 0.448 0 1 0H7ZM16 17.6H12V19.8H16V17.6ZM16 8.8H12V11H16V8.8ZM6 2.2H2V4.4H6V2.2Z" />
        </svg>
    )
}
