import { exec as _exec } from "child_process"
import download from "download"
import { r1cs, zKey } from "snarkjs"
import fs from "fs"
import util from "util"
import { config } from "../package.json"
import logger from "js-logger"

logger.useDefaults()

async function exec(command: string) {
    const { stderr, stdout } = await util.promisify(_exec)(command)

    if (stderr) {
        throw new Error(stderr)
    }

    logger.info(stdout)
}

async function main() {
    const buildPath = config.paths.build.snark

    if (!fs.existsSync(buildPath)) {
        fs.mkdirSync(buildPath, { recursive: true })
    }

    if (!fs.existsSync(`${buildPath}/powersOfTau28_hez_final_14.ptau`)) {
        const url = "https://hermez.s3-eu-west-1.amazonaws.com"
        const fileName = "powersOfTau28_hez_final_14.ptau"

        await download(`${url}/${fileName}`, buildPath)
    }

    await exec(`circom ./circuits/semaphore.circom --r1cs --wasm --sym -o ${buildPath}`)

    await r1cs.info(`${buildPath}/semaphore.r1cs`, logger)

    await zKey.newZKey(
        `${buildPath}/semaphore.r1cs`,
        `${buildPath}/powersOfTau28_hez_final_14.ptau`,
        `${buildPath}/semaphore_0000.zkey`,
        logger
    )

    await zKey.beacon(
        `${buildPath}/semaphore_0000.zkey`,
        `${buildPath}/semaphore_final.zkey`,
        "Final Beacon",
        "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
        10,
        logger
    )

    const verificationKey = await zKey.exportVerificationKey(`${buildPath}/semaphore_final.zkey`, logger)

    let verifierCode = await zKey.exportSolidityVerifier(
        `${buildPath}/semaphore_final.zkey`,
        { groth16: fs.readFileSync("./node_modules/snarkjs/templates/verifier_groth16.sol.ejs", "utf8") },
        logger
    )
    verifierCode = verifierCode.replace(/pragma solidity \^\d+\.\d+\.\d+/, "pragma solidity ^0.8.0")

    fs.writeFileSync(`${buildPath}/verification_key.json`, JSON.stringify(verificationKey), "utf-8")
    fs.writeFileSync(`${config.paths.contracts}/Verifier.sol`, verifierCode, "utf-8")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
