/* eslint-disable import/prefer-default-export */
/* eslint-disable no-return-assign */
/* istanbul ignore file */

export function log2(V: any) {
    return (
        ((V & 0xffff0000) !== 0 ? ((V &= 0xffff0000), 16) : 0) |
        ((V & 0xff00ff00) !== 0 ? ((V &= 0xff00ff00), 8) : 0) |
        ((V & 0xf0f0f0f0) !== 0 ? ((V &= 0xf0f0f0f0), 4) : 0) |
        ((V & 0xcccccccc) !== 0 ? ((V &= 0xcccccccc), 2) : 0) |
        // @ts-ignore
        ((V & 0xaaaaaaaa) !== 0)
    )
}
