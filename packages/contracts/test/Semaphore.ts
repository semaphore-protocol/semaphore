/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable jest/valid-expect */
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { FullProof, generateProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { constants, Signer } from "ethers"
import { ethers, run } from "hardhat"
import { Pairing, Semaphore } from "../build/typechain"
import { createIdentityCommitments } from "./utils"

describe("Semaphore", () => {
    let semaphoreContract: Semaphore
    let pairingContract: Pairing
    let signers: Signer[]
    let accounts: string[]

    const treeDepth = Number(process.env.TREE_DEPTH) || 20
    const groupId = 1
    const group = new Group(groupId, treeDepth)
    const members = createIdentityCommitments(3)

    const wasmFilePath = `../../snark-artifacts/${treeDepth}/semaphore.wasm`
    const zkeyFilePath = `../../snark-artifacts/${treeDepth}/semaphore.zkey`

    before(async () => {
        const { semaphore, pairingAddress } = await run("deploy:semaphore", {
            logs: false
        })

        semaphoreContract = semaphore
        pairingContract = await ethers.getContractAt("Pairing", pairingAddress)

        signers = await run("accounts", { logs: false })
        accounts = await Promise.all(signers.map((signer: Signer) => signer.getAddress()))
    })

    describe("# createGroup", () => {
        it("Should not create a group if the tree depth is not supported", async () => {
            const transaction = semaphoreContract["createGroup(uint256,uint256,address)"](groupId, 10, accounts[0])

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__MerkleTreeDepthIsNotSupported"
            )
        })

        it("Should create a group", async () => {
            const transaction = semaphoreContract
                .connect(signers[1])
                ["createGroup(uint256,uint256,address)"](groupId, treeDepth, accounts[1])

            await expect(transaction)
                .to.emit(semaphoreContract, "GroupCreated")
                .withArgs(groupId, treeDepth, group.zeroValue)
            await expect(transaction)
                .to.emit(semaphoreContract, "GroupAdminUpdated")
                .withArgs(groupId, constants.AddressZero, accounts[1])
        })

        it("Should create a group with a custom Merkle tree root expiration", async () => {
            const groupId = 2
            const group = new Group(2)
            const transaction = await semaphoreContract
                .connect(signers[1])
                ["createGroup(uint256,uint256,address,uint256)"](
                    groupId,
                    treeDepth,
                    accounts[0],
                    5 // 5 seconds.
                )
            await semaphoreContract.addMember(groupId, members[0])
            await semaphoreContract.addMember(groupId, members[1])
            await semaphoreContract.addMember(groupId, members[2])

            await expect(transaction)
                .to.emit(semaphoreContract, "GroupCreated")
                .withArgs(groupId, treeDepth, group.zeroValue)
            await expect(transaction)
                .to.emit(semaphoreContract, "GroupAdminUpdated")
                .withArgs(groupId, constants.AddressZero, accounts[0])
        })
    })

    describe("# updateGroupMerkleTreeDuration", () => {
        it("Should not update a group Merkle tree duration if the caller is not the group admin", async () => {
            const transaction = semaphoreContract.updateGroupMerkleTreeDuration(groupId, 300)

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__CallerIsNotTheGroupAdmin"
            )
        })

        it("Should update the group Merkle tree duration", async () => {
            const transaction = semaphoreContract.connect(signers[1]).updateGroupMerkleTreeDuration(groupId, 300)

            await expect(transaction)
                .to.emit(semaphoreContract, "GroupMerkleTreeDurationUpdated")
                .withArgs(groupId, 3600, 300)
        })
    })

    describe("# updateGroupAdmin", () => {
        it("Should not update a group admin if the caller is not the group admin", async () => {
            const transaction = semaphoreContract.updateGroupAdmin(groupId, accounts[0])

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__CallerIsNotTheGroupAdmin"
            )
        })

        it("Should update the group admin", async () => {
            const transaction = semaphoreContract.connect(signers[1]).updateGroupAdmin(groupId, accounts[0])

            await expect(transaction)
                .to.emit(semaphoreContract, "GroupAdminUpdated")
                .withArgs(groupId, accounts[1], accounts[0])
        })
    })

    describe("# addMember", () => {
        it("Should not add a member if the caller is not the group admin", async () => {
            const member = BigInt(2)

            const transaction = semaphoreContract.connect(signers[1]).addMember(groupId, member)

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__CallerIsNotTheGroupAdmin"
            )
        })

        it("Should add a new member in an existing group", async () => {
            const group = new Group(groupId, treeDepth)

            group.addMember(members[0])

            const transaction = semaphoreContract.addMember(groupId, members[0])

            await expect(transaction)
                .to.emit(semaphoreContract, "MemberAdded")
                .withArgs(groupId, 0, members[0], group.root)
        })
    })

    describe("# addMembers", () => {
        it("Should add new members to an existing group", async () => {
            const groupId = 3
            const members = [BigInt(1), BigInt(2), BigInt(3)]
            const group = new Group(groupId, treeDepth)

            group.addMembers(members)

            await semaphoreContract["createGroup(uint256,uint256,address)"](groupId, treeDepth, accounts[0])

            const transaction = semaphoreContract.addMembers(groupId, members)

            await expect(transaction)
                .to.emit(semaphoreContract, "MemberAdded")
                .withArgs(groupId, 2, BigInt(3), group.root)
        })
    })

    describe("# updateMember", () => {
        it("Should not update a member if the caller is not the group admin", async () => {
            const member = BigInt(2)

            const transaction = semaphoreContract.connect(signers[1]).updateMember(groupId, member, 1, [0, 1], [0, 1])

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__CallerIsNotTheGroupAdmin"
            )
        })

        it("Should update a member from an existing group", async () => {
            const groupId = 4
            const members = [BigInt(1), BigInt(2), BigInt(3)]
            const group = new Group(groupId, treeDepth)

            group.addMembers(members)

            group.updateMember(0, BigInt(4))

            await semaphoreContract["createGroup(uint256,uint256,address)"](groupId, treeDepth, accounts[0])
            await semaphoreContract.addMembers(groupId, members)

            const { siblings, pathIndices, root } = group.generateMerkleProof(0)

            const transaction = semaphoreContract.updateMember(groupId, BigInt(1), BigInt(4), siblings, pathIndices)

            await expect(transaction)
                .to.emit(semaphoreContract, "MemberUpdated")
                .withArgs(groupId, 0, BigInt(1), BigInt(4), root)
        })
    })

    describe("# removeMember", () => {
        it("Should not remove a member if the caller is not the group admin", async () => {
            const member = BigInt(2)

            const transaction = semaphoreContract.connect(signers[1]).removeMember(groupId, member, [0, 1], [0, 1])

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__CallerIsNotTheGroupAdmin"
            )
        })

        it("Should remove a member from an existing group", async () => {
            const groupId = 5
            const members = [BigInt(1), BigInt(2), BigInt(3)]
            const group = new Group(groupId, treeDepth)

            group.addMembers(members)

            group.removeMember(2)

            await semaphoreContract["createGroup(uint256,uint256,address)"](groupId, treeDepth, accounts[0])
            await semaphoreContract.addMembers(groupId, members)

            const { siblings, pathIndices, root } = group.generateMerkleProof(2)

            const transaction = semaphoreContract.removeMember(groupId, BigInt(3), siblings, pathIndices)

            await expect(transaction).to.emit(semaphoreContract, "MemberRemoved").withArgs(groupId, 2, BigInt(3), root)
        })
    })

    describe("# verifyProof", () => {
        const signal = 2
        const identity = new Identity("0")

        const group = new Group(groupId, treeDepth)

        group.addMembers(members)

        let fullProof: FullProof

        before(async () => {
            await semaphoreContract.addMembers(groupId, [members[1], members[2]])

            fullProof = await generateProof(identity, group, group.root, signal, {
                wasmFilePath,
                zkeyFilePath
            })
        })

        it("Should not verify a proof if the group does not exist", async () => {
            const transaction = semaphoreContract.verifyProof(10, 1, signal, 0, 0, [0, 0, 0, 0, 0, 0, 0, 0])

            await expect(transaction).to.be.revertedWithCustomError(semaphoreContract, "Semaphore__GroupDoesNotExist")
        })

        it("Should not verify a proof if the Merkle tree root is not part of the group", async () => {
            const transaction = semaphoreContract.verifyProof(2, 1, signal, 0, 0, [0, 0, 0, 0, 0, 0, 0, 0])

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__MerkleTreeRootIsNotPartOfTheGroup"
            )
        })

        it("Should throw an exception if the proof is not valid", async () => {
            const transaction = semaphoreContract.verifyProof(
                groupId,
                fullProof.merkleTreeRoot,
                fullProof.signal,
                fullProof.nullifierHash,
                0,
                fullProof.proof
            )

            await expect(transaction).to.be.revertedWithCustomError(pairingContract, "InvalidProof")
        })

        it("Should verify a proof for an onchain group correctly", async () => {
            const transaction = semaphoreContract.verifyProof(
                groupId,
                fullProof.merkleTreeRoot,
                fullProof.signal,
                fullProof.nullifierHash,
                fullProof.merkleTreeRoot,
                fullProof.proof
            )

            await expect(transaction)
                .to.emit(semaphoreContract, "ProofVerified")
                .withArgs(
                    groupId,
                    fullProof.merkleTreeRoot,
                    fullProof.nullifierHash,
                    fullProof.merkleTreeRoot,
                    fullProof.signal
                )
        })

        it("Should not verify the same proof for an onchain group twice", async () => {
            const transaction = semaphoreContract.verifyProof(
                groupId,
                fullProof.merkleTreeRoot,
                fullProof.signal,
                fullProof.nullifierHash,
                fullProof.merkleTreeRoot,
                fullProof.proof
            )

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__YouAreUsingTheSameNillifierTwice"
            )
        })

        it("Should not verify a proof if the Merkle tree root is expired", async () => {
            const groupId = 2
            const group = new Group(groupId, treeDepth)

            group.addMembers([members[0], members[1]])

            const fullProof = await generateProof(identity, group, group.root, signal, {
                wasmFilePath,
                zkeyFilePath
            })

            const transaction = semaphoreContract.verifyProof(
                groupId,
                fullProof.merkleTreeRoot,
                fullProof.signal,
                fullProof.nullifierHash,
                fullProof.merkleTreeRoot,
                fullProof.proof
            )

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__MerkleTreeRootIsExpired"
            )
        })
    })
})
