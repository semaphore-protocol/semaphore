/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable jest/valid-expect */
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { FullProof, generateProof, packToSolidityProof, SolidityProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { constants, Signer, utils } from "ethers"
import { run } from "hardhat"
import { Semaphore } from "../build/typechain"
import { createIdentityCommitments } from "./utils"

describe("Semaphore", () => {
    let contract: Semaphore
    let signers: Signer[]
    let accounts: string[]

    const treeDepth = Number(process.env.TREE_DEPTH) || 20
    const groupId = 1
    const members = createIdentityCommitments(3)

    const wasmFilePath = `../../snark-artifacts/semaphore.wasm`
    const zkeyFilePath = `../../snark-artifacts/semaphore.zkey`

    before(async () => {
        const { address: verifierAddress } = await run("deploy:verifier", { logs: false, depth: treeDepth })
        contract = await run("deploy:semaphore", {
            logs: false,
            verifiers: [{ merkleTreeDepth: treeDepth, contractAddress: verifierAddress }]
        })

        signers = await run("accounts", { logs: false })
        accounts = await Promise.all(signers.map((signer: Signer) => signer.getAddress()))
    })

    describe("# createGroup", () => {
        it("Should not create a group if the tree depth is not supported", async () => {
            const transaction = contract["createGroup(uint256,uint256,uint256,address)"](groupId, 10, 0, accounts[0])

            await expect(transaction).to.be.revertedWith("Semaphore__MerkleTreeDepthIsNotSupported()")
        })

        it("Should create a group", async () => {
            const transaction = contract
                .connect(signers[1])
                ["createGroup(uint256,uint256,uint256,address)"](groupId, treeDepth, 0, accounts[1])

            await expect(transaction).to.emit(contract, "GroupCreated").withArgs(groupId, treeDepth, 0)
            await expect(transaction)
                .to.emit(contract, "GroupAdminUpdated")
                .withArgs(groupId, constants.AddressZero, accounts[1])
        })

        it("Should create a group with a custom Merkle tree root expiration", async () => {
            const groupId = 2
            const transaction = await contract
                .connect(signers[1])
                ["createGroup(uint256,uint256,uint256,address,uint256)"](
                    groupId,
                    treeDepth,
                    0,
                    accounts[0],
                    5 // 5 seconds.
                )
            await contract.addMember(groupId, members[0])
            await contract.addMember(groupId, members[1])
            await contract.addMember(groupId, members[2])

            await expect(transaction).to.emit(contract, "GroupCreated").withArgs(groupId, treeDepth, 0)
            await expect(transaction)
                .to.emit(contract, "GroupAdminUpdated")
                .withArgs(groupId, constants.AddressZero, accounts[0])
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

            await expect(transaction)
                .to.emit(contract, "MemberAdded")
                .withArgs(
                    groupId,
                    0,
                    members[0],
                    "18951329906296061785889394467312334959162736293275411745101070722914184798221"
                )
        })
    })

    describe("# addMembers", () => {
        it("Should add new members to an existing group", async () => {
            const groupId = 3
            const members = [BigInt(1), BigInt(2), BigInt(3)]
            const group = new Group(treeDepth)

            group.addMembers(members)

            await contract["createGroup(uint256,uint256,uint256,address)"](groupId, treeDepth, 0, accounts[0])

            const transaction = contract.addMembers(groupId, members)

            await expect(transaction).to.emit(contract, "MemberAdded").withArgs(groupId, 2, BigInt(3), group.root)
        })
    })

    describe("# updateMember", () => {
        it("Should not update a member if the caller is not the group admin", async () => {
            const member = BigInt(2)

            const transaction = contract.connect(signers[1]).updateMember(groupId, member, 1, [0, 1], [0, 1])

            await expect(transaction).to.be.revertedWith("Semaphore__CallerIsNotTheGroupAdmin()")
        })

        it("Should update a member from an existing group", async () => {
            const groupId = 4
            const members = [BigInt(1), BigInt(2), BigInt(3)]
            const group = new Group(treeDepth)

            group.addMembers(members)

            group.updateMember(0, BigInt(4))

            await contract["createGroup(uint256,uint256,uint256,address)"](groupId, treeDepth, 0, accounts[0])
            await contract.addMembers(groupId, members)

            const { siblings, pathIndices, root } = group.generateProofOfMembership(0)

            const transaction = contract.updateMember(groupId, BigInt(1), BigInt(4), siblings, pathIndices)

            await expect(transaction)
                .to.emit(contract, "MemberUpdated")
                .withArgs(groupId, 0, BigInt(1), BigInt(4), root)
        })
    })

    describe("# removeMember", () => {
        it("Should not remove a member if the caller is not the group admin", async () => {
            const member = BigInt(2)

            const transaction = contract.connect(signers[1]).removeMember(groupId, member, [0, 1], [0, 1])

            await expect(transaction).to.be.revertedWith("Semaphore__CallerIsNotTheGroupAdmin()")
        })

        it("Should remove a member from an existing group", async () => {
            const groupId = 5
            const members = [BigInt(1), BigInt(2), BigInt(3)]
            const group = new Group(treeDepth)

            group.addMembers(members)

            group.removeMember(2)

            await contract["createGroup(uint256,uint256,uint256,address)"](groupId, treeDepth, 0, accounts[0])
            await contract.addMembers(groupId, members)

            const { siblings, pathIndices, root } = group.generateProofOfMembership(2)

            const transaction = contract.removeMember(groupId, BigInt(3), siblings, pathIndices)

            await expect(transaction).to.emit(contract, "MemberRemoved").withArgs(groupId, 2, BigInt(3), root)
        })
    })

    describe("# verifyProof", () => {
        const signal = utils.formatBytes32String("Hello world")
        const identity = new Identity("0")

        const group = new Group(treeDepth)

        group.addMembers(members)

        let fullProof: FullProof
        let solidityProof: SolidityProof

        before(async () => {
            await contract.addMembers(groupId, [members[1], members[2]])

            fullProof = await generateProof(identity, group, group.root, signal, {
                wasmFilePath,
                zkeyFilePath
            })
            solidityProof = packToSolidityProof(fullProof.proof)
        })

        it("Should not verify a proof if the group does not exist", async () => {
            const transaction = contract.verifyProof(10, 1, signal, 0, 0, [0, 0, 0, 0, 0, 0, 0, 0])

            await expect(transaction).to.be.revertedWith("Semaphore__GroupDoesNotExist()")
        })

        it("Should not verify a proof if the Merkle tree root is not part of the group", async () => {
            const transaction = contract.verifyProof(2, 1, signal, 0, 0, [0, 0, 0, 0, 0, 0, 0, 0])

            await expect(transaction).to.be.revertedWith("Semaphore__MerkleTreeRootIsNotPartOfTheGroup()")
        })

        it("Should throw an exception if the proof is not valid", async () => {
            const transaction = contract.verifyProof(
                groupId,
                group.root,
                signal,
                fullProof.publicSignals.nullifierHash,
                0,
                solidityProof
            )

            await expect(transaction).to.be.revertedWith("InvalidProof()")
        })

        it("Should verify a proof for an onchain group correctly", async () => {
            const transaction = contract.verifyProof(
                groupId,
                group.root,
                signal,
                fullProof.publicSignals.nullifierHash,
                fullProof.publicSignals.merkleRoot,
                solidityProof
            )

            await expect(transaction)
                .to.emit(contract, "ProofVerified")
                .withArgs(
                    groupId,
                    group.root,
                    fullProof.publicSignals.nullifierHash,
                    fullProof.publicSignals.externalNullifier,
                    signal
                )
        })

        it("Should not verify the same proof for an onchain group twice", async () => {
            const transaction = contract.verifyProof(
                groupId,
                group.root,
                signal,
                fullProof.publicSignals.nullifierHash,
                fullProof.publicSignals.merkleRoot,
                solidityProof
            )

            await expect(transaction).to.be.revertedWith("Semaphore__YouAreUsingTheSameNillifierTwice()")
        })

        it("Should not verify a proof if the Merkle tree root is expired", async () => {
            const groupId = 2
            const group = new Group(treeDepth)

            group.addMembers([members[0], members[1]])

            const fullProof = await generateProof(identity, group, group.root, signal, {
                wasmFilePath,
                zkeyFilePath
            })
            const solidityProof = packToSolidityProof(fullProof.proof)

            const transaction = contract.verifyProof(
                groupId,
                group.root,
                signal,
                fullProof.publicSignals.nullifierHash,
                0,
                solidityProof
            )

            await expect(transaction).to.be.revertedWith("Semaphore__MerkleTreeRootIsExpired()")
        })
    })
})
