import { Strategy, ZkIdentity } from "@zk-kit/identity"
import { generateMerkleProof, Semaphore, SemaphoreFullProof, SemaphoreSolidityProof } from "@zk-kit/protocols"
import { expect } from "chai"
import { constants, Signer, utils } from "ethers"
import { run } from "hardhat"
import { Semaphore as SemaphoreContract } from "../build/typechain/Semaphore"
import { createIdentityCommitments, createTree } from "./utils"
import { config } from "../package.json"

describe("Semaphore", () => {
    let contract: SemaphoreContract
    let signers: Signer[]
    let accounts: string[]

    const depth = Number(process.env.TREE_DEPTH)
    const groupId = 1
    const members = createIdentityCommitments(3)

    const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
    const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`

    before(async () => {
        const { address: verifierAddress } = await run("deploy:verifier", { logs: false, depth })
        contract = await run("deploy:semaphore", {
            logs: false,
            verifiers: [{ merkleTreeDepth: depth, contractAddress: verifierAddress }]
        })

        signers = await run("accounts", { logs: false })
        accounts = await Promise.all(signers.map((signer: Signer) => signer.getAddress()))
    })

    describe("# createGroup", () => {
        it("Should not create a group if the tree depth is not supported", async () => {
            const transaction = contract.createGroup(groupId, 10, 0, accounts[0])

            await expect(transaction).to.be.revertedWith("Semaphore: tree depth is not supported")
        })

        it("Should create a group", async () => {
            const transaction = contract.connect(signers[1]).createGroup(groupId, depth, 0, accounts[1])

            await expect(transaction).to.emit(contract, "GroupCreated").withArgs(groupId, depth, 0)
            await expect(transaction)
                .to.emit(contract, "GroupAdminUpdated")
                .withArgs(groupId, constants.AddressZero, accounts[1])
        })
    })

    describe("# updateGroupAdmin", () => {
        it("Should not update a group admin if the caller is not the group admin", async () => {
            const transaction = contract.updateGroupAdmin(groupId, accounts[0])

            await expect(transaction).to.be.revertedWith("Semaphore: caller is not the group admin")
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

            await expect(transaction).to.be.revertedWith("Semaphore: caller is not the group admin")
        })

        it("Should add a new member in an existing group", async () => {
            const transaction = contract.addMember(groupId, members[0])

            await expect(transaction)
                .to.emit(contract, "MemberAdded")
                .withArgs(
                    groupId,
                    members[0],
                    "18951329906296061785889394467312334959162736293275411745101070722914184798221"
                )
        })
    })

    describe("# removeMember", () => {
        it("Should not remove a member if the caller is not the group admin", async () => {
            const transaction = contract.connect(signers[1]).removeMember(groupId, members[0], [0, 1], [0, 1])

            await expect(transaction).to.be.revertedWith("Semaphore: caller is not the group admin")
        })

        it("Should remove a member from an existing group", async () => {
            const groupId = 100
            const tree = createTree(depth, 3)

            tree.delete(0)

            await contract.createGroup(groupId, depth, 0, accounts[0])
            await contract.addMember(groupId, BigInt(1))
            await contract.addMember(groupId, BigInt(2))
            await contract.addMember(groupId, BigInt(3))

            const { siblings, pathIndices, root } = tree.createProof(0)

            const transaction = contract.removeMember(
                groupId,
                BigInt(1),
                siblings.map((s) => s[0]),
                pathIndices
            )

            await expect(transaction).to.emit(contract, "MemberRemoved").withArgs(groupId, BigInt(1), root)
        })
    })

    describe("# verifyProof", () => {
        const signal = "Hello world"
        const bytes32Signal = utils.formatBytes32String(signal)
        const identity = new ZkIdentity(Strategy.MESSAGE, "0")
        const identityCommitment = identity.genIdentityCommitment()
        const merkleProof = generateMerkleProof(depth, BigInt(0), members, identityCommitment)
        const witness = Semaphore.genWitness(
            identity.getTrapdoor(),
            identity.getNullifier(),
            merkleProof,
            merkleProof.root,
            signal
        )

        let fullProof: SemaphoreFullProof
        let solidityProof: SemaphoreSolidityProof

        before(async () => {
            await contract.addMember(groupId, members[1])
            await contract.addMember(groupId, members[2])

            fullProof = await Semaphore.genProof(witness, wasmFilePath, zkeyFilePath)
            solidityProof = Semaphore.packToSolidityProof(fullProof.proof)
        })

        it("Should not verify a proof if the group does not exist", async () => {
            const transaction = contract.verifyProof(10, bytes32Signal, 0, 0, [0, 0, 0, 0, 0, 0, 0, 0])

            await expect(transaction).to.be.revertedWith("Semaphore: group does not exist")
        })

        it("Should throw an exception if the proof is not valid", async () => {
            const transaction = contract.verifyProof(
                groupId,
                bytes32Signal,
                fullProof.publicSignals.nullifierHash,
                0,
                solidityProof
            )

            await expect(transaction).to.be.revertedWith("InvalidProof()")
        })

        it("Should verify a proof for an onchain group correctly", async () => {
            const transaction = contract.verifyProof(
                groupId,
                bytes32Signal,
                fullProof.publicSignals.nullifierHash,
                fullProof.publicSignals.merkleRoot,
                solidityProof
            )

            await expect(transaction).to.emit(contract, "ProofVerified").withArgs(groupId, bytes32Signal)
        })
    })
})
