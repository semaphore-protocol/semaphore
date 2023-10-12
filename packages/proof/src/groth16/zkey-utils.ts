/* eslint-disable import/prefer-default-export */
/* istanbul ignore file */

// @ts-ignore
import * as binFileUtils from "@iden3/binfileutils"
import { buildBn128 } from "ffjavascript"
import { log2 } from "./utils"

async function readG1(fd: any, curve: any, toObject: any) {
    const buff = await fd.read(curve.G1.F.n8 * 2)
    const res = curve.G1.fromRprLEM(buff, 0)
    return toObject ? curve.G1.toObject(res) : res
}

async function readG2(fd: any, curve: any, toObject: any) {
    const buff = await fd.read(curve.G2.F.n8 * 2)
    const res = curve.G2.fromRprLEM(buff, 0)
    return toObject ? curve.G2.toObject(res) : res
}

async function readHeaderGroth16(fd: any, sections: any, toObject: any) {
    const zkey: any = {}

    zkey.protocol = "groth16"

    await binFileUtils.startReadUniqueSection(fd, sections, 2)
    const n8q = await fd.readULE32()
    zkey.n8q = n8q
    zkey.q = await binFileUtils.readBigInt(fd, n8q)

    const n8r = await fd.readULE32()
    zkey.n8r = n8r
    zkey.r = await binFileUtils.readBigInt(fd, n8r)

    // @ts-ignore
    zkey.curve = globalThis.curve_bn128 ?? (await buildBn128(undefined, undefined))

    zkey.nVars = await fd.readULE32()
    zkey.nPublic = await fd.readULE32()
    zkey.domainSize = await fd.readULE32()
    zkey.power = log2(zkey.domainSize)
    zkey.vk_alpha_1 = await readG1(fd, zkey.curve, toObject)
    zkey.vk_beta_1 = await readG1(fd, zkey.curve, toObject)
    zkey.vk_beta_2 = await readG2(fd, zkey.curve, toObject)
    zkey.vk_gamma_2 = await readG2(fd, zkey.curve, toObject)
    zkey.vk_delta_1 = await readG1(fd, zkey.curve, toObject)
    zkey.vk_delta_2 = await readG2(fd, zkey.curve, toObject)
    await binFileUtils.endReadSection(fd)

    return zkey
}

export async function readHeader(fd: any, sections: any, toObject: any) {
    await binFileUtils.startReadUniqueSection(fd, sections, 1)
    const protocolId = await fd.readULE32()
    await binFileUtils.endReadSection(fd)

    if (protocolId === 1) {
        return readHeaderGroth16(fd, sections, toObject)
    }

    throw new Error("Protocol not supported: ")
}
