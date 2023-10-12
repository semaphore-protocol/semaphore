/* eslint-disable eqeqeq */
/* istanbul ignore file */

// @ts-ignore
import * as binFileUtils from "@iden3/binfileutils"
// @ts-ignore
import { WitnessCalculatorBuilder } from "circom_runtime"
// @ts-ignore
import * as fastFile from "fastfile"
import { utils } from "ffjavascript"
import * as wtnsUtils from "./wtns-utils"

const { unstringifyBigInts } = utils

export default async function wtnsCalculate(_input: any, wasmFileName: any, wtnsFileName: any) {
    const input = unstringifyBigInts(_input)

    const fdWasm = await fastFile.readExisting(wasmFileName)
    const wasm = await fdWasm.read(fdWasm.totalSize)
    await fdWasm.close()

    const wc = await WitnessCalculatorBuilder(wasm)

    if (wc.circom_version() == 1) {
        const w = await wc.calculateBinWitness(input)

        const fdWtns = await binFileUtils.createBinFile(wtnsFileName, "wtns", 2, 2)

        await wtnsUtils.writeBin(fdWtns, w, wc.prime)
        await fdWtns.close()
    } else {
        const fdWtns = await fastFile.createOverride(wtnsFileName)

        const w = await wc.calculateWTNSBin(input)

        await fdWtns.write(w)
        await fdWtns.close()
    }
}
