/* eslint-disable eqeqeq */
/* istanbul ignore file */

// @ts-ignore
import * as binFileUtils from "@iden3/binfileutils"
import { Scalar } from "ffjavascript"

export async function writeBin(fd: any, witnessBin: any, prime: any) {
    await binFileUtils.startWriteSection(fd, 1)
    const n8 = (Math.floor((Scalar.bitLength(prime) - 1) / 64) + 1) * 8
    await fd.writeULE32(n8)
    await binFileUtils.writeBigInt(fd, prime, n8)
    if (witnessBin.byteLength % n8 != 0) {
        throw new Error("Invalid witness length")
    }
    await fd.writeULE32(witnessBin.byteLength / n8)
    await binFileUtils.endWriteSection(fd)

    await binFileUtils.startWriteSection(fd, 2)
    await fd.write(witnessBin)
    await binFileUtils.endWriteSection(fd)
}

export async function readHeader(fd: any, sections: any) {
    await binFileUtils.startReadUniqueSection(fd, sections, 1)
    const n8 = await fd.readULE32()
    const q = await binFileUtils.readBigInt(fd, n8)
    const nWitness = await fd.readULE32()
    await binFileUtils.endReadSection(fd)

    return { n8, q, nWitness }
}
