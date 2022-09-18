export default function checkParameter(value: any, name: string, type: string) {
    if (typeof value !== type) {
        throw new TypeError(`Parameter '${name}' is not a ${type}`)
    }
}
