<<<<<<< HEAD
import { LinkedGroup } from "@webb-tools/semaphore-group"
import { Identity } from "@webb-tools/semaphore-identity/src"
// import { BigNumber } from 'ethers';
// import download from "download"
import fs from "fs"
import generateNullifierHash from "./generateNullifierHash"
import { generateProof } from "./generateProof"
=======
import { formatBytes32String } from "@ethersproject/strings"
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { getCurveFromName } from "ffjavascript"
import fs from "fs"
import generateNullifierHash from "./generateNullifierHash"
import generateProof from "./generateProof"
>>>>>>> origin/main
import generateSignalHash from "./generateSignalHash"
import packToSolidityProof from "./packToSolidityProof"
import { FullProof } from "./types"
import verifyProof from "./verifyProof"

describe("Proof", () => {
<<<<<<< HEAD
  const treeDepth = 20
  const maxEdges = 1

  const externalNullifier = "1"
  const signal = "0x111"
  const chainID = BigInt(1099511629113)

  const snarkArtifactsPath = "./packages/proof/snark-artifacts"
  const wasmFilePath = `${snarkArtifactsPath}/semaphore_20_2.wasm`
  const zkeyFilePath = `${snarkArtifactsPath}/circuit_final.zkey`

  const identity = new Identity(chainID)
  const identityCommitment = identity.generateCommitment()

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
            wasmFilePath: wasmFilePath,
            zkeyFilePath: zkeyFilePath
          }
        )
=======
    const treeDepth = Number(process.env.TREE_DEPTH) || 20

    const externalNullifier = "1"
    const signal = "0x111"

    const wasmFilePath = `./snark-artifacts/semaphore.wasm`
    const zkeyFilePath = `./snark-artifacts/semaphore.zkey`
    const verificationKeyPath = `./snark-artifacts/semaphore.json`

    const identity = new Identity()

    let fullProof: FullProof
    let curve: any

    beforeAll(async () => {
        curve = await getCurveFromName("bn128")
    })

    afterAll(async () => {
        await curve.terminate()
    })

    describe("# generateProof", () => {
        it("Should not generate Semaphore proofs if the identity is not part of the group", async () => {
            const group = new Group(treeDepth)

            group.addMembers([BigInt(1), BigInt(2)])

            const fun = () =>
                generateProof(identity, group, externalNullifier, signal, {
                    wasmFilePath,
                    zkeyFilePath
                })
>>>>>>> origin/main

      await expect(fun).rejects.toThrow("The identity is not part of the group")
    })

<<<<<<< HEAD
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
          wasmFilePath: wasmFilePath,
          zkeyFilePath: zkeyFilePath
        }
      )

      expect(typeof fullProof).toBe("object")
      expect(fullProof.publicSignals.externalNullifier).toBe(externalNullifier)
    }, 20000)

    it("Should generate a Semaphore proof passing a Merkle proof as parametr", async () => {
      const linkedGroup = new LinkedGroup(treeDepth, maxEdges)

      linkedGroup.addMembers([BigInt(1), BigInt(2), identityCommitment])

      fullProof = await generateProof(
        identity,
        linkedGroup,
        externalNullifier,
        signal,
        chainID,
        {
          wasmFilePath: wasmFilePath,
          zkeyFilePath: zkeyFilePath
        }
      )

      expect(typeof fullProof).toBe("object")
      expect(fullProof.publicSignals.externalNullifier).toBe(externalNullifier)
=======
        it("Should not generate a Semaphore proof with default snark artifacts with Node.js", async () => {
            const group = new Group(treeDepth)

            group.addMembers([BigInt(1), BigInt(2), identity.commitment])

            const fun = () => generateProof(identity, group, externalNullifier, signal)

            await expect(fun).rejects.toThrow("ENOENT: no such file or directory")
        })

        it("Should generate a Semaphore proof passing a group as parameter", async () => {
            const group = new Group(treeDepth)

            group.addMembers([BigInt(1), BigInt(2), identity.commitment])

            fullProof = await generateProof(identity, group, externalNullifier, signal, {
                wasmFilePath,
                zkeyFilePath
            })

            expect(typeof fullProof).toBe("object")
            expect(fullProof.publicSignals.externalNullifier).toBe(externalNullifier)
            expect(fullProof.publicSignals.merkleRoot).toBe(group.root.toString())
        }, 20000)

        it("Should generate a Semaphore proof passing a Merkle proof as parametr", async () => {
            const group = new Group(treeDepth)

            group.addMembers([BigInt(1), BigInt(2), identity.commitment])

            fullProof = await generateProof(identity, group.generateProofOfMembership(2), externalNullifier, signal, {
                wasmFilePath,
                zkeyFilePath
            })

            expect(typeof fullProof).toBe("object")
            expect(fullProof.publicSignals.externalNullifier).toBe(externalNullifier)
            expect(fullProof.publicSignals.merkleRoot).toBe(group.root.toString())
>>>>>>> origin/main
    }, 20000)
  })

  describe("# generateSignalHash", () => {
    it("Should generate a valid signal hash", async () => {
      const signalHash = generateSignalHash(signal)

      expect(signalHash.toString()).toBe(fullProof.publicSignals.signalHash)
    })
<<<<<<< HEAD
=======

        it("Should generate a valid signal hash by passing a valid hex string", async () => {
            const signalHash = generateSignalHash(formatBytes32String(signal))

            expect(signalHash.toString()).toBe(fullProof.publicSignals.signalHash)
        })
>>>>>>> origin/main
  })

  describe("# generateNullifierHash", () => {
    it("Should generate a valid nullifier hash", async () => {
<<<<<<< HEAD
      const nullifierHash = generateNullifierHash(
        externalNullifier,
        identity.getNullifier()
      )

      expect(nullifierHash.toString()).toBe(
        fullProof.publicSignals.nullifierHash
      )
=======
            const nullifierHash = generateNullifierHash(externalNullifier, identity.getNullifier())

            expect(nullifierHash.toString()).toBe(fullProof.publicSignals.nullifierHash)
>>>>>>> origin/main
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
<<<<<<< HEAD
      const verificationKey = JSON.parse(
        fs.readFileSync(`${snarkArtifactsPath}/semaphore.json`, "utf-8")
      )
=======
            const verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath, "utf-8"))
>>>>>>> origin/main

      const response = await verifyProof(verificationKey, fullProof)

      expect(response).toBe(true)
    })
  })
})
