import { LinkedGroup } from "@webb-tools/semaphore-group"
import { Identity } from "@webb-tools/semaphore-identity"
// import { BigNumber } from 'ethers';
// import download from "download"
import fs from "fs"
import generateNullifierHash from "./generateNullifierHash"
import { getCurveFromName } from "ffjavascript"
import generateProof from "./generateProof"
import { formatBytes32String } from "@ethersproject/strings"
import generateSignalHash from "./generateSignalHash"
import packToSolidityProof from "./packToSolidityProof"
import { FullProof } from "./types"
import verifyProof from "./verifyProof"

describe("Proof", () => {
  const treeDepth = Number(process.env.TREE_DEPTH) || 20
  const maxEdges = 1

  const externalNullifier = "1"
  const signal = "0x111"
  const chainID = BigInt(1099511629113)

  const snarkArtifactsPath = "./packages/proof/snark-artifacts"
  const wasmFilePath = `${snarkArtifactsPath}/semaphore_20_2.wasm`
  const zkeyFilePath = `${snarkArtifactsPath}/circuit_final.zkey`
  const verificationKey = JSON.parse(fs.readFileSync(`${snarkArtifactsPath}/verification_key.json`).toString())
  const identity = new Identity()
  const identityCommitment = identity.commitment

  let fullProof: FullProof

  beforeAll(async () => {
    if (!fs.existsSync(snarkArtifactsPath)) {
      fs.mkdirSync(snarkArtifactsPath)
    }
  }, 10000)

  describe("# generateProof", () => {
    it("Should not generate Semaphore proofs if the identity is not part of the group", async () => {
      const linkedGroup = new LinkedGroup(treeDepth, maxEdges)

      linkedGroup.addMembers([BigInt(1), BigInt(2)])

      const fun = () =>
        generateProof(
          identity,
          linkedGroup,
          externalNullifier,
          signal,
          chainID,
          {
            wasmFilePath,
            zkeyFilePath
          }
        )

      await expect(fun).rejects.toThrow("The identity is not part of the group")
    })
    // it("Should not generate a Semaphore proof with default snark artifacts with Node.js", async () => {
    //   const linkedGroup = new LinkedGroup(treeDepth, maxEdges)
    //
    //   linkedGroup.addMembers([BigInt(1), BigInt(2), identity.commitment])
    //
    //   const fun = () => generateProof(identity, linkedGroup, externalNullifier, signal, chainID)
    //
    //   await expect(fun).rejects.toThrow("ENOENT: no such file or directory")
    // })

    it("Should generate a Semaphore proof passing a linkedGroup as parameter", async () => {
      const linkedGroup = new LinkedGroup(treeDepth, maxEdges)

      linkedGroup.addMembers([BigInt(1), BigInt(2), identityCommitment])

      fullProof = await generateProof(
        identity,
        linkedGroup,
        externalNullifier,
        signal,
        chainID,
        {
          wasmFilePath,
          zkeyFilePath
        }
      )

      expect(typeof fullProof).toBe("object")
      expect(fullProof.publicSignals.externalNullifier).toBe(externalNullifier)
    }, 20000)
  })

  describe("# generateSignalHash", () => {
    it("Should generate a valid signal hash", async () => {
      const signalHash = generateSignalHash(signal)

      expect(signalHash.toString()).toBe(fullProof.publicSignals.signalHash)
    })

    it("Should generate a valid signal hash by passing a valid hex string", async () => {
      const signalHash = generateSignalHash(formatBytes32String(signal))

      expect(signalHash.toString()).toBe(fullProof.publicSignals.signalHash)
    })
  })

  describe("# generateNullifierHash", () => {
    it("Should generate a valid nullifier hash", async () => {
      const nullifierHash = generateNullifierHash(externalNullifier, identity.nullifier)

      expect(nullifierHash.toString()).toBe(fullProof.publicSignals.nullifierHash)
    })
  })

  describe("# packToSolidityProof", () => {
    it("Should return a Solidity proof", async () => {
      const solidityProof = packToSolidityProof(fullProof.proof)

      expect(solidityProof).toHaveLength(8)
    })
  })

  describe("# verifyProof", () => {
    it("Should generate and verify a Semaphore proof", async () => {
      const response = await verifyProof(verificationKey, fullProof)

      expect(response).toBe(true)
    })
  })
})
