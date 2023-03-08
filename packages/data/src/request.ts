import axios, { AxiosRequestConfig, AxiosResponse } from "axios"

/**
 * Returns the response data of an HTTP request.
 * @param url HTTP URL.
 * @param config Axios request configuration.
 * @returns Request data.
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
