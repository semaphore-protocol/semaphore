/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable jest/valid-expect */
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { SemaphoreProof, generateProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { Signer, ZeroAddress } from "ethers"
import { run } from "hardhat"
import { Semaphore } from "../typechain-types"

describe("Semaphore", () => {
    let semaphoreContract: Semaphore
    let signers: Signer[]
    let accounts: string[]

    const groupId = 1
    const members = Array.from({ length: 3 }, (_, i) => new Identity(i)).map(({ commitment }) => commitment)

    before(async () => {
        const { semaphore } = await run("deploy:semaphore", {
            logs: false
        })

        semaphoreContract = semaphore

        signers = await run("accounts", { logs: false })
        accounts = await Promise.all(signers.map((signer: Signer) => signer.getAddress()))
    })

    describe("# createGroup", () => {
        it("Should create a group", async () => {
            const transaction = semaphoreContract
                .connect(signers[1])
                ["createGroup(uint256,address)"](groupId, accounts[1])

            await expect(transaction).to.emit(semaphoreContract, "GroupCreated").withArgs(groupId)
            await expect(transaction)
                .to.emit(semaphoreContract, "GroupAdminUpdated")
                .withArgs(groupId, ZeroAddress, accounts[1])
        })

        it("Should create a group with a custom Merkle tree root expiration", async () => {
            const groupId = 2
            const transaction = await semaphoreContract.connect(signers[1])["createGroup(uint256,address,uint256)"](
                groupId,
                accounts[0],
                5 // 5 seconds.
            )
            await semaphoreContract.addMember(groupId, members[0])
            await semaphoreContract.addMember(groupId, members[1])
            await semaphoreContract.addMember(groupId, members[2])

            await expect(transaction).to.emit(semaphoreContract, "GroupCreated").withArgs(groupId)
            await expect(transaction)
                .to.emit(semaphoreContract, "GroupAdminUpdated")
                .withArgs(groupId, ZeroAddress, accounts[0])
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
            const group = new Group()

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
            const members = Array.from({ length: 100 }, (_, i) => BigInt(i + 1))
            const group = new Group()

            group.addMembers(members)

            await semaphoreContract["createGroup(uint256,address)"](groupId, accounts[0])

            const transaction = semaphoreContract.addMembers(groupId, members)

            await expect(transaction)
                .to.emit(semaphoreContract, "MembersAdded")
                .withArgs(groupId, 0, members, group.root)
        })
    })

    describe("# updateMember", () => {
        it("Should not update a member if the caller is not the group admin", async () => {
            const member = BigInt(2)

            const transaction = semaphoreContract.connect(signers[1]).updateMember(groupId, member, 1, [0, 1])

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__CallerIsNotTheGroupAdmin"
            )
        })

        it("Should update a member from an existing group", async () => {
            const groupId = 4
            const members = [BigInt(1), BigInt(2), BigInt(3)]
            const group = new Group()

            group.addMembers(members)

            group.updateMember(0, BigInt(4))

            await semaphoreContract["createGroup(uint256,address)"](groupId, accounts[0])
            await semaphoreContract.addMembers(groupId, members)

            const { siblings, root } = group.generateMerkleProof(0)

            const transaction = semaphoreContract.updateMember(groupId, BigInt(1), BigInt(4), siblings)

            await expect(transaction)
                .to.emit(semaphoreContract, "MemberUpdated")
                .withArgs(groupId, 0, BigInt(1), BigInt(4), root)
        })
    })

    describe("# removeMember", () => {
        it("Should not remove a member if the caller is not the group admin", async () => {
            const member = BigInt(2)

            const transaction = semaphoreContract.connect(signers[1]).removeMember(groupId, member, [0, 1])

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__CallerIsNotTheGroupAdmin"
            )
        })

        it("Should remove a member from an existing group", async () => {
            const groupId = 5
            const members = [BigInt(1), BigInt(2), BigInt(3)]
            const group = new Group()

            group.addMembers(members)

            group.removeMember(2)

            await semaphoreContract["createGroup(uint256,address)"](groupId, accounts[0])
            await semaphoreContract.addMembers(groupId, members)

            const { siblings, root } = group.generateMerkleProof(2)

            const transaction = semaphoreContract.removeMember(groupId, BigInt(3), siblings)

            await expect(transaction).to.emit(semaphoreContract, "MemberRemoved").withArgs(groupId, 2, BigInt(3), root)
        })
    })

    describe.skip("# verifyProof", () => {
        const groupId = 10
        const message = 2
        const identity = new Identity("0")

        const group = new Group()

        group.addMembers(members)

        let fullProof: SemaphoreProof

        before(async () => {
            await semaphoreContract["createGroup(uint256,address)"](groupId, accounts[0])

            await semaphoreContract.addMembers(groupId, members)

            fullProof = await generateProof(identity, group, message, group.root as string, 10)
        })

        it("Should not verify a proof if the group does not exist", async () => {
            const transaction = semaphoreContract.verifyProof(11, 1, 0, message, 0, [0, 0, 0, 0, 0, 0, 0, 0])

            await expect(transaction).to.be.revertedWithCustomError(semaphoreContract, "Semaphore__GroupDoesNotExist")
        })

        it("Should not verify a proof if the Merkle tree root is not part of the group", async () => {
            const transaction = semaphoreContract.verifyProof(groupId, 1, 0, message, 0, [0, 0, 0, 0, 0, 0, 0, 0])

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__MerkleTreeRootIsNotPartOfTheGroup"
            )
        })

        it("Should verify a proof for an onchain group", async () => {
            const validProof = await semaphoreContract.verifyProof(
                groupId,
                fullProof.merkleRoot,
                fullProof.nullifier,
                fullProof.message,
                fullProof.merkleRoot,
                fullProof.proof
            )

            expect(validProof).to.equal(true)
        })

        it("Should not verify a proof if the Merkle tree root is expired", async () => {
            const groupId = 2

            const group = new Group()

            group.addMembers([members[0], members[1]])

            const fullProof = await generateProof(identity, group, message, group.root as string, 10)

            const transaction = semaphoreContract.verifyProof(
                groupId,
                fullProof.merkleRoot,
                fullProof.nullifier,
                fullProof.message,
                fullProof.merkleRoot,
                fullProof.proof
            )

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__MerkleTreeRootIsExpired"
            )
        })
    })

    describe.skip("# validateProof", () => {
        const message = 2
        const identity = new Identity("0")
        const groupOneMemberId = 6

        const group = new Group()
        const groupOneMember = new Group()

        group.addMembers(members)
        groupOneMember.addMember(members[0])

        let fullProof: SemaphoreProof
        let fullProofOneMember: SemaphoreProof

        before(async () => {
            await semaphoreContract["createGroup(uint256,address)"](groupOneMemberId, accounts[0])

            await semaphoreContract.addMembers(groupId, [members[1], members[2]])
            await semaphoreContract.addMember(groupOneMemberId, members[0])

            fullProof = await generateProof(identity, group, message, group.root as string, 10)
            fullProofOneMember = await generateProof(
                identity,
                groupOneMember,
                message,
                groupOneMember.root as string,
                10
            )
        })

        it("Should throw an exception if the proof is not valid", async () => {
            const transaction = semaphoreContract.validateProof(
                groupId,
                fullProof.merkleRoot,
                fullProof.nullifier,
                fullProof.message,
                0,
                fullProof.proof
            )

            await expect(transaction).to.be.revertedWithCustomError(semaphoreContract, "Semaphore__InvalidProof")
        })

        it("Should validate a proof for an onchain group with one member correctly", async () => {
            const transaction = semaphoreContract.validateProof(
                groupOneMemberId,
                fullProofOneMember.merkleRoot,
                fullProofOneMember.nullifier,
                fullProofOneMember.message,
                fullProofOneMember.merkleRoot,
                fullProofOneMember.proof
            )

            await expect(transaction)
                .to.emit(semaphoreContract, "ProofValidated")
                .withArgs(
                    groupOneMemberId,
                    fullProofOneMember.merkleRoot,
                    fullProofOneMember.nullifier,
                    fullProofOneMember.message,
                    fullProofOneMember.merkleRoot,
                    fullProofOneMember.proof
                )
        })

        it("Should validate a proof for an onchain group with more than one member correctly", async () => {
            const transaction = semaphoreContract.validateProof(
                groupId,
                fullProof.merkleRoot,
                fullProof.nullifier,
                fullProof.message,
                fullProof.merkleRoot,
                fullProof.proof
            )

            await expect(transaction)
                .to.emit(semaphoreContract, "ProofValidated")
                .withArgs(
                    groupId,
                    fullProof.merkleRoot,
                    fullProof.nullifier,
                    fullProof.message,
                    fullProof.merkleRoot,
                    fullProof.proof
                )
        })

        it("Should not validate the same proof for an onchain group twice", async () => {
            const transaction = semaphoreContract.validateProof(
                groupId,
                fullProof.merkleRoot,
                fullProof.nullifier,
                fullProof.message,
                fullProof.merkleRoot,
                fullProof.proof
            )

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__YouAreUsingTheSameNullifierTwice"
            )
        })
    })
})
