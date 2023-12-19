import React from "react"

export type IconEyeCloseProps = {
    width?: number
    height?: number
}

export default function IconEyeClose({ width = 24, height = 24 }: IconEyeCloseProps): JSX.Element {
    return (
        <svg
            className="custom-icon"
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M9.34178 18.7824L7.41078 18.2644L8.19778 15.3254C7.01975 14.8909 5.9249 14.2577 4.96078 13.4534L2.80778 15.6074L1.39278 14.1924L3.54678 12.0394C2.33086 10.5831 1.51387 8.83611 1.17578 6.96935L3.14378 6.61035C3.90278 10.8124 7.57878 14.0004 11.9998 14.0004C16.4198 14.0004 20.0968 10.8124 20.8558 6.61035L22.8238 6.96835C22.4861 8.83537 21.6695 10.5827 20.4538 12.0394L22.6068 14.1924L21.1918 15.6074L19.0388 13.4534C18.0747 14.2577 16.9798 14.8909 15.8018 15.3254L16.5888 18.2654L14.6578 18.7824L13.8698 15.8424C12.6321 16.0544 11.3674 16.0544 10.1298 15.8424L9.34178 18.7824Z" />
        </svg>
    )
}
