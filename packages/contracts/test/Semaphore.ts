/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable jest/valid-expect */
import { Group, Identity, SemaphoreProof, generateProof } from "@semaphore-protocol/core"
import { expect } from "chai"
import { Signer, ZeroAddress } from "ethers"
import { run } from "hardhat"
// @ts-ignore
import { Semaphore } from "../typechain-types"

describe("Semaphore", () => {
    let semaphoreContract: Semaphore
    let accounts: Signer[]
    let accountAddresses: string[]

    const merkleTreeDepth = 12

    const groupId = 0
    const members = Array.from({ length: 3 }, (_, i) => new Identity(i)).map(({ commitment }) => commitment)

    before(async () => {
        const { semaphore } = await run("deploy", {
            logs: false
        })

        semaphoreContract = semaphore

        accounts = await run("accounts", { logs: false })
        accountAddresses = await Promise.all(accounts.map((signer: Signer) => signer.getAddress()))
    })

    describe("# createGroup", () => {
        it("Should create a group", async () => {
            const groupId = 0
            const transaction = semaphoreContract.connect(accounts[1])["createGroup(address)"](accountAddresses[1])

            await expect(transaction).to.emit(semaphoreContract, "GroupCreated").withArgs(groupId)
            await expect(transaction)
                .to.emit(semaphoreContract, "GroupAdminUpdated")
                .withArgs(groupId, ZeroAddress, accountAddresses[1])
        })

        it("Should create a group with a custom Merkle tree root expiration", async () => {
            const groupId = 1
            const transaction = await semaphoreContract.connect(accounts[1])["createGroup(address,uint256)"](
                accountAddresses[0],
                5 // 5 seconds.
            )
            await semaphoreContract.addMember(groupId, members[0])
            await semaphoreContract.addMember(groupId, members[1])
            await semaphoreContract.addMember(groupId, members[2])

            await expect(transaction).to.emit(semaphoreContract, "GroupCreated").withArgs(groupId)
            await expect(transaction)
                .to.emit(semaphoreContract, "GroupAdminUpdated")
                .withArgs(groupId, ZeroAddress, accountAddresses[0])
        })

        it("Should create a group without any parameters", async () => {
            const groupId = 2

            const transaction = await semaphoreContract["createGroup()"]()

            await expect(transaction).to.emit(semaphoreContract, "GroupCreated").withArgs(groupId)
            await expect(transaction)
                .to.emit(semaphoreContract, "GroupAdminUpdated")
                .withArgs(groupId, ZeroAddress, accountAddresses[0])
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
            const transaction = semaphoreContract.connect(accounts[1]).updateGroupMerkleTreeDuration(groupId, 300)

            await expect(transaction)
                .to.emit(semaphoreContract, "GroupMerkleTreeDurationUpdated")
                .withArgs(groupId, 3600, 300)
        })
    })

    describe("# updateGroupAdmin", () => {
        it("Should not update a group admin if the caller is not the group admin", async () => {
            const transaction = semaphoreContract.updateGroupAdmin(groupId, accountAddresses[0])

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__CallerIsNotTheGroupAdmin"
            )
        })

        it("Should update the group admin", async () => {
            const transaction = semaphoreContract.connect(accounts[1]).updateGroupAdmin(groupId, accountAddresses[0])

            await expect(transaction)
                .to.emit(semaphoreContract, "GroupAdminUpdated")
                .withArgs(groupId, accountAddresses[1], accountAddresses[0])
        })
    })

    describe("# addMember", () => {
        it("Should not add a member if the caller is not the group admin", async () => {
            const member = BigInt(2)

            const transaction = semaphoreContract.connect(accounts[1]).addMember(groupId, member)

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
        it("Should not add members if the caller is not the group admin", async () => {
            const members = [BigInt(1), BigInt(2), BigInt(3)]

            const transaction = semaphoreContract.connect(accounts[1]).addMembers(groupId, members)

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__CallerIsNotTheGroupAdmin"
            )
        })

        it("Should add new members to an existing group", async () => {
            const groupId = 3
            const members = [BigInt(1), BigInt(2), BigInt(3)]
            const group = new Group()

            group.addMembers(members)

            await semaphoreContract["createGroup(address)"](accountAddresses[0])

            const transaction = semaphoreContract.addMembers(groupId, members)

            await expect(transaction)
                .to.emit(semaphoreContract, "MembersAdded")
                .withArgs(groupId, 0, members, group.root)
        })
    })

    describe("# updateMember", () => {
        it("Should not update a member if the caller is not the group admin", async () => {
            const member = BigInt(2)

            const transaction = semaphoreContract.connect(accounts[1]).updateMember(groupId, member, 1, [0, 1])

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

            await semaphoreContract["createGroup(address)"](accountAddresses[0])
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

            const transaction = semaphoreContract.connect(accounts[1]).removeMember(groupId, member, [0, 1])

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

            await semaphoreContract["createGroup(address)"](accountAddresses[0])
            await semaphoreContract.addMembers(groupId, members)

            const { siblings, root } = group.generateMerkleProof(2)

            const transaction = semaphoreContract.removeMember(groupId, BigInt(3), siblings)

            await expect(transaction).to.emit(semaphoreContract, "MemberRemoved").withArgs(groupId, 2, BigInt(3), root)
        })
    })

    describe("# getGroupAdmin", () => {
        it("Should return a 0 address if the group does not exist", async () => {
            const address = await semaphoreContract.getGroupAdmin(999)

            expect(address).to.equal(ZeroAddress)
        })

        it("Should return the address of the group admin", async () => {
            const address = await semaphoreContract.getGroupAdmin(groupId)

            expect(address).to.equal(accountAddresses[0])
        })
    })

    describe("# verifyProof", () => {
        const groupId = 6
        const message = 2
        const identity = new Identity("0")

        const group = new Group()

        group.addMembers(members)

        let proof: SemaphoreProof

        before(async () => {
            await semaphoreContract["createGroup(address)"](accountAddresses[0])

            await semaphoreContract.addMembers(groupId, members)

            proof = await generateProof(identity, group, message, group.root as string, merkleTreeDepth)
        })

        it("Should not verify a proof if the group does not exist", async () => {
            const transaction = semaphoreContract.verifyProof(11, proof)

            await expect(transaction).to.be.revertedWithCustomError(semaphoreContract, "Semaphore__GroupDoesNotExist")
        })

        it("Should not verify a proof if the Merkle tree root is not part of the group", async () => {
            const transaction = semaphoreContract.verifyProof(groupId, { ...proof, merkleTreeRoot: 1 })

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__MerkleTreeRootIsNotPartOfTheGroup"
            )
        })

        it("Should verify a proof for an onchain group", async () => {
            const validProof = await semaphoreContract.verifyProof(groupId, proof)

            expect(validProof).to.equal(true)
        })

        it("Should not verify a proof if the Merkle tree root is expired", async () => {
            const groupId = 1

            const group = new Group()

            group.addMembers([members[0], members[1]])

            const proof = await generateProof(identity, group, message, group.root as string, merkleTreeDepth)

            const transaction = semaphoreContract.verifyProof(groupId, proof)

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__MerkleTreeRootIsExpired"
            )
        })

        it("Should not verify a proof if the Merkle depth is not supported", async () => {
            const scope = "random-scope"

            const proof = await generateProof(identity, group, message, scope, merkleTreeDepth)

            proof.merkleTreeDepth = 33

            const transaction = semaphoreContract.verifyProof(groupId, proof)

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__MerkleTreeDepthIsNotSupported"
            )
        })

        it("Should not verify a proof if the group has no members", async () => {
            const groupId = 7
            await semaphoreContract["createGroup(address)"](accountAddresses[0])

            const transaction = semaphoreContract.verifyProof(groupId, proof)

            await expect(transaction).to.be.revertedWithCustomError(semaphoreContract, "Semaphore__GroupHasNoMembers")
        })
    })

    describe("# validateProof", () => {
        const message = 2
        const identity = new Identity("0")
        const groupOneMemberId = 7

        const group = new Group()
        const groupOneMember = new Group()

        group.addMembers(members)
        groupOneMember.addMember(members[0])

        let proof: SemaphoreProof
        let proofOneMember: SemaphoreProof

        before(async () => {
            await semaphoreContract["createGroup(address)"](accountAddresses[0])

            await semaphoreContract.addMembers(groupId, [members[1], members[2]])
            await semaphoreContract.addMember(groupOneMemberId, members[0])

            proof = await generateProof(identity, group, message, group.root as string, merkleTreeDepth)
            proofOneMember = await generateProof(
                identity,
                groupOneMember,
                message,
                groupOneMember.root as string,
                merkleTreeDepth
            )
        })

        it("Should throw an exception if the proof is not valid", async () => {
            const transaction = semaphoreContract.validateProof(groupId, { ...proof, scope: 0 })

            await expect(transaction).to.be.revertedWithCustomError(semaphoreContract, "Semaphore__InvalidProof")
        })

        it("Should validate a proof for an onchain group with one member correctly", async () => {
            const transaction = semaphoreContract.validateProof(groupOneMemberId, proofOneMember)

            await expect(transaction)
                .to.emit(semaphoreContract, "ProofValidated")
                .withArgs(
                    groupOneMemberId,
                    proofOneMember.merkleTreeDepth,
                    proofOneMember.merkleTreeRoot,
                    proofOneMember.nullifier,
                    proofOneMember.message,
                    proofOneMember.merkleTreeRoot,
                    proofOneMember.points
                )
        })

        it("Should validate a proof for an onchain group with more than one member correctly", async () => {
            const transaction = semaphoreContract.validateProof(groupId, proof)

            await expect(transaction)
                .to.emit(semaphoreContract, "ProofValidated")
                .withArgs(
                    groupId,
                    proof.merkleTreeDepth,
                    proof.merkleTreeRoot,
                    proof.nullifier,
                    proof.message,
                    proof.merkleTreeRoot,
                    proof.points
                )
        })

        it("Should not validate the same proof for an onchain group twice", async () => {
            const transaction = semaphoreContract.validateProof(groupId, proof)

            await expect(transaction).to.be.revertedWithCustomError(
                semaphoreContract,
                "Semaphore__YouAreUsingTheSameNullifierTwice"
            )
        })
    })
})
