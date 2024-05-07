import axios, { AxiosRequestConfig, AxiosResponse } from "axios"

/**
 * Sends an HTTP request to a specified URL and returns the parsed response data.
 * @param url The URL to which the HTTP request is sent.
 * @param config Optional Axios request configuration to customize headers, method, timeout, etc.
 * @returns A promise that resolves to the data extracted from the response, typically in JSON format.
 */
/* istanbul ignore next */
export default async function request(url: string, config?: AxiosRequestConfig): Promise<any> {
    const { data }: AxiosResponse<any> = await axios(url, {
        headers: {
            "Content-Type": "application/json",
            ...config?.headers
        },
        ...config
    })

    return data?.data
}
