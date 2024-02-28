export default function shortenString(s: string, l: [number, number]) {
    return `${s.slice(0, l[0])}...${s.slice(-l[1])}`
}
