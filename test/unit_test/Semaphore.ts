import { expect } from "chai"
import { constants, Signer, utils, BigNumber } from "ethers"
import { run } from "hardhat"
import { Semaphore as SemaphoreContract } from "../../build/typechain"
import { config } from "../../package.json"
// import { SnarkArtifacts } from "@semaphore-protocol/proof"
import { Group } from "../../packages/group/src"
import { FullProof, generateProof, packToSolidityProof, SolidityProof, BigNumberish } from "../../packages/proof/src/"
import { toFixedHex, VerifierContractInfo, createRootsBytes, createIdentities } from "../utils"

describe("Semaphore", () => {
    let contract: SemaphoreContract
    let signers: Signer[]
    let accounts: string[]

    const treeDepth = Number(process.env.TREE_DEPTH) | 20
    const circuitLength = Number(process.env.CIRCUIT_LENGTH) | 2
    const groupId = 1
    const maxEdges = 1
    const chainID = BigInt(1099511629113)
    const zeroValue = BigInt("21663839004416932945382355908790599225266501822907911457504978515578255421292")
    const { identities, members } = createIdentities(Number(chainID), 3)

    const wasmFilePath = `${config.paths.build["snark-artifacts"]}/${treeDepth}/2/semaphore_20_2.wasm`
    const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/${treeDepth}/2/circuit_final.zkey`

    before(async () => {
        const { address: v2_address } = await run("deploy:verifier", {
            logs: false,
            depth: treeDepth,
            circuitLength: circuitLength
        })
        const VerifierV2: VerifierContractInfo = {
            name: `Verifier${treeDepth}_${circuitLength}`,
            address: v2_address,
            depth: `${treeDepth}`,
            circuitLength: `2`
        }

        const { address: v7_address } = await run("deploy:verifier", { logs: false, depth: treeDepth, maxEdges: 7 })
        const VerifierV7: VerifierContractInfo = {
            name: `Verifier${treeDepth}_${7}`,
            address: v7_address,
            depth: `${treeDepth}`,
            circuitLength: `7`
        }

        const deployedVerifiers: Map<string, VerifierContractInfo> = new Map([
            ["v2", VerifierV2],
            ["v7", VerifierV7]
        ])

        const verifierSelector = await run("deploy:verifier-selector", {
            logs: false,
            verifiers: deployedVerifiers
        })

        contract = await run("deploy:semaphore", {
            logs: false,
            verifiers: [{ merkleTreeDepth: treeDepth, contractAddress: verifierSelector.address }]
        })

        signers = await run("accounts", { logs: false })
        accounts = await Promise.all(signers.map((signer: Signer) => signer.getAddress()))
    })

    describe("# createGroup", () => {
        it("Should not create a group if the tree depth is not supported", async () => {
            const transaction = contract.createGroup(groupId, 10, accounts[0], maxEdges)

            await expect(transaction).to.be.revertedWith("Semaphore__TreeDepthIsNotSupported()")
        })

        it("Should create a group", async () => {
            const transaction = contract.connect(signers[1]).createGroup(groupId, treeDepth, accounts[1], maxEdges)

            await expect(transaction).to.emit(contract, "GroupCreated").withArgs(groupId, treeDepth)
            await expect(transaction)
                .to.emit(contract, "GroupAdminUpdated")
                .withArgs(groupId, constants.AddressZero, accounts[1])
        })
    })

    describe("# updateGroupAdmin", () => {
        it("Should not update a group admin if the caller is not the group admin", async () => {
            const transaction = contract.updateGroupAdmin(groupId, accounts[0])

            await expect(transaction).to.be.revertedWith("Semaphore__CallerIsNotTheGroupAdmin()")
        })

        it("Should update the group admin", async () => {
            const transaction = contract.connect(signers[1]).updateGroupAdmin(groupId, accounts[0])

            await expect(transaction).to.emit(contract, "GroupAdminUpdated").withArgs(groupId, accounts[1], accounts[0])
        })
    })

    describe("# addMember", () => {
        it("Should not add a member if the caller is not the group admin", async () => {
            const member = BigInt(2)

            const transaction = contract.connect(signers[1]).addMember(groupId, member)

            await expect(transaction).to.be.revertedWith("Semaphore__CallerIsNotTheGroupAdmin()")
        })

        it("Should add a new member in an existing group", async () => {
            const transaction = contract.addMember(groupId, members[0])

            const group = new Group(treeDepth, BigInt(zeroValue))
            group.addMember(members[0])

            await expect(transaction).to.emit(contract, "MemberAdded").withArgs(
                groupId,
                members[0],
                group.root
            )
        })
    })

    describe("# removeMember", () => {
        it("Should not remove a member if the caller is not the group admin", async () => {
            const transaction = contract.connect(signers[1]).removeMember(groupId, members[0], [0, 1], [0, 1])

            await expect(transaction).to.be.revertedWith("Semaphore__CallerIsNotTheGroupAdmin()")
        })

        it("Should remove a member from an existing group", async () => {
            const groupId = 100
            const group = new Group(treeDepth, BigInt(zeroValue))

            group.addMembers([BigInt(1), BigInt(2), BigInt(3)])

            group.removeMember(0)

            await contract.createGroup(groupId, treeDepth, accounts[0], maxEdges)
            await contract.addMember(groupId, BigInt(1))
            await contract.addMember(groupId, BigInt(2))
            await contract.addMember(groupId, BigInt(3))

            const { siblings, pathIndices, root } = group.generateProofOfMembership(0)

            const transaction = contract.removeMember(groupId, BigInt(1), siblings, pathIndices)

            await expect(transaction).to.emit(contract, "MemberRemoved").withArgs(groupId, BigInt(1), root)
        })
    })

    describe("# verifyProof", () => {
        const signal = "Hello world"
        const bytes32Signal = utils.formatBytes32String(signal)
        const groupId2 = 1337

        const group = new Group(treeDepth, BigInt(zeroValue))
        group.addMember(members[0])
        group.addMember(members[1])
        group.addMember(members[2])

        let fullProof: FullProof
        let solidityProof: SolidityProof
        let roots: string[]

        before(async () => {
            await contract.createGroup(groupId2, treeDepth, accounts[0], maxEdges)

            await contract.addMember(groupId2, members[0])
            await contract.addMember(groupId2, members[1])
            await contract.addMember(groupId2, members[2])

            roots = [BigNumber.from(group.root).toHexString(), toFixedHex(0)]

            fullProof = await generateProof(identities[0], group, roots, BigInt(Date.now()), signal, chainID, {
                wasmFilePath,
                zkeyFilePath
            })
            solidityProof = packToSolidityProof(fullProof.proof)
        })

        it("Should not verify a proof if the group does not exist", async () => {
            const transaction = contract.verifyProof(
                10,
                bytes32Signal,
                0,
                0,
                createRootsBytes(roots),
                [0, 0, 0, 0, 0, 0, 0, 0]
            )

            await expect(transaction).to.be.revertedWith("Semaphore__GroupDoesNotExist()")
        })

        it("Should throw an exception if the proof is not valid", async () => {
            const transaction = contract.verifyProof(
                groupId2,
                bytes32Signal,
                fullProof.publicSignals.nullifierHash,
                0,
                createRootsBytes(roots),
                solidityProof
            )
            await expect(transaction).to.be.revertedWith("invalidProof")
        })

        it("Should verify a proof for an onchain group correctly", async () => {
            const transaction = contract.verifyProof(
                groupId2,
                bytes32Signal,
                fullProof.publicSignals.nullifierHash,
                fullProof.publicSignals.externalNullifier,
                createRootsBytes(fullProof.publicSignals.roots),
                solidityProof
            )

            await expect(transaction).to.emit(contract, "ProofVerified").withArgs(groupId2, bytes32Signal)
        })
    })
})
