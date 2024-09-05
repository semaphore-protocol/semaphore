export default function ShiftTower(W: number, digest: (values: number[]) => number) {
    const S: number[][] = []
    const L: number[][] = []

    function _add(lv: number, v: number): number {
        if (lv === L.length) {
            S[lv] = []
            L[lv] = [v]
        } else if (L[lv].length < W) {
            L[lv].push(v)
        } else {
            const d = digest(L[lv])
            S[lv].push(...L[lv])
            L[lv] = [v]
            return _add(lv + 1, d)
        }
        return lv
    }
    const add = (item: number) => _add(0, item)
    return { W, digest, L, S, add }
}
