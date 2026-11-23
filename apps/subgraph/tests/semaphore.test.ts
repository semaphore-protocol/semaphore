/* eslint-disable jest/expect-expect */
import { Address, BigInt, ByteArray } from "@graphprotocol/graph-ts"
import { afterAll, afterEach, assert, beforeEach, clearStore, describe, test } from "matchstick-as/assembly/index"
import {
    addMember,
    addMembers,
    addValidatedProof,
    createGroup,
    removeMember,
    updateGroupAdmin,
    updateMember
} from "../src/semaphore"
import { concat, hash } from "../src/utils"
import {
    createGroupAdminUpdatedEvent,
    createGroupCreatedEvent,
    createMemberAddedEvent,
    createMemberRemovedEvent,
    createMemberUpdatedEvent,
    createMembersAddedEvent,
    createProofVerifiedEvent
} from "./semaphore-utils"

// https://thegraph.com/docs/en/developer/matchstick
describe("Semaphore subgraph", () => {
    afterAll(() => {
        clearStore()
    })

    describe("# createGroup", () => {
        test("Should have created a group", () => {
            const groupId = BigInt.fromI32(234)
            const oldAdmin = Address.fromString("0x0000000000000000000000000000000000000000")
            const newAdmin = Address.fromString("0x0000000000000000000000000000000000000001")

            const event1 = createGroupCreatedEvent(groupId)
            const event2 = createGroupAdminUpdatedEvent(groupId, oldAdmin, newAdmin)

            createGroup(event1)
            updateGroupAdmin(event2)

            assert.entityCount("Group", 1)
            assert.entityCount("MerkleTree", 1)

            assert.fieldEquals("Group", groupId.toString(), "admin", "0x0000000000000000000000000000000000000001")
            assert.fieldEquals("Group", groupId.toString(), "merkleTree", groupId.toString())

            assert.fieldEquals("MerkleTree", groupId.toString(), "depth", "0")
            assert.fieldEquals("MerkleTree", groupId.toString(), "size", "0")
            assert.fieldEquals("MerkleTree", groupId.toString(), "group", groupId.toString())
        })
    })

    describe("# updateGroupAdmin", () => {
        test("Should have updated a group admin", () => {
            const groupId = BigInt.fromI32(234)
            const oldAdmin = Address.fromString("0x0000000000000000000000000000000000000001")
            const newAdmin = Address.fromString("0x0000000000000000000000000000000000000002")

            const event = createGroupAdminUpdatedEvent(groupId, oldAdmin, newAdmin)

            updateGroupAdmin(event)

            assert.fieldEquals("Group", groupId.toString(), "admin", "0x0000000000000000000000000000000000000002")
        })
    })

    describe("# addMember", () => {
        test("Should have added a group member", () => {
            const groupId = BigInt.fromI32(234)
            const index = BigInt.fromI32(0)
            const identityCommitment = BigInt.fromI32(123)
            const merkleTreeRoot = BigInt.fromI32(999)
            const id = hash(concat(ByteArray.fromBigInt(index), ByteArray.fromBigInt(groupId)))

            const event = createMemberAddedEvent(groupId, index, identityCommitment, merkleTreeRoot)

            addMember(event)

            assert.entityCount("Member", 1)

            assert.fieldEquals("Member", id, "index", "0")
            assert.fieldEquals("Member", id, "identityCommitment", "123")
            assert.fieldEquals("Member", id, "group", groupId.toString())

            assert.fieldEquals("MerkleTree", groupId.toString(), "root", "999")
            assert.fieldEquals("MerkleTree", groupId.toString(), "size", "1")
            assert.fieldEquals("MerkleTree", groupId.toString(), "depth", "0")
        })
    })

    describe("# updateMember", () => {
        test("Should have added a group member", () => {
            const groupId = BigInt.fromI32(234)
            const index = BigInt.fromI32(0)
            const identityCommitment = BigInt.fromI32(123)
            const newIdentityCommitment = BigInt.fromI32(124)
            const merkleTreeRoot = BigInt.fromI32(1000)
            const id = hash(concat(ByteArray.fromBigInt(index), ByteArray.fromBigInt(groupId)))

            const event = createMemberUpdatedEvent(
                groupId,
                index,
                identityCommitment,
                newIdentityCommitment,
                merkleTreeRoot
            )

            updateMember(event)

            assert.fieldEquals("Member", id, "identityCommitment", "124")

            assert.fieldEquals("MerkleTree", groupId.toString(), "root", "1000")
        })
    })

    describe("# removeMember", () => {
        test("Should have removed a group member", () => {
            const groupId = BigInt.fromI32(234)
            const index = BigInt.fromI32(0)
            const identityCommitment = BigInt.fromI32(123)
            const merkleTreeRoot = BigInt.fromI32(1001)
            const id = hash(concat(ByteArray.fromBigInt(index), ByteArray.fromBigInt(groupId)))

            const event = createMemberRemovedEvent(groupId, index, identityCommitment, merkleTreeRoot)

            removeMember(event)

            assert.fieldEquals("Member", id, "identityCommitment", "0")

            assert.fieldEquals("MerkleTree", groupId.toString(), "root", "1001")
        })
    })

    describe("# addMembers", () => {
        test("Should have added many group members at once", () => {
            const groupId = BigInt.fromI32(234)
            const startIndex = BigInt.fromI32(1)
            const identityCommitments = [BigInt.fromI32(123), BigInt.fromI32(124)]
            const merkleTreeRoot = BigInt.fromI32(999)
            const id = hash(concat(ByteArray.fromBigInt(startIndex), ByteArray.fromBigInt(groupId)))

            const event = createMembersAddedEvent(groupId, startIndex, identityCommitments, merkleTreeRoot)

            addMembers(event)

            assert.entityCount("Member", 3)

            assert.fieldEquals("Member", id, "index", "1")
            assert.fieldEquals("Member", id, "identityCommitment", "123")
            assert.fieldEquals("Member", id, "group", groupId.toString())

            assert.fieldEquals("MerkleTree", groupId.toString(), "root", "999")
            assert.fieldEquals("MerkleTree", groupId.toString(), "size", "3")
            assert.fieldEquals("MerkleTree", groupId.toString(), "depth", "2")
        })
    })

    describe("# addVerifiedProof", () => {
        test("Should have added a proof", () => {
            const groupId = BigInt.fromI32(234)
            const merkleTreeDepth = BigInt.fromI32(32)
            const merkleTreeRoot = BigInt.fromI32(1001)
            const nullifier = BigInt.fromI32(666)
            const message = BigInt.fromI32(2)
            const scope = BigInt.fromI32(1)
            const points = [BigInt.fromI32(1), BigInt.fromI32(2)]
            const id = hash(concat(ByteArray.fromBigInt(nullifier), ByteArray.fromBigInt(groupId)))

            const event = createProofVerifiedEvent(
                groupId,
                merkleTreeDepth,
                merkleTreeRoot,
                nullifier,
                message,
                scope,
                points
            )

            addValidatedProof(event)

            assert.entityCount("ValidatedProof", 1)

            assert.fieldEquals("ValidatedProof", id, "group", groupId.toString())
            assert.fieldEquals("ValidatedProof", id, "merkleTreeRoot", "1001")
            assert.fieldEquals("ValidatedProof", id, "merkleTreeDepth", "32")
            assert.fieldEquals("ValidatedProof", id, "scope", "1")
            assert.fieldEquals("ValidatedProof", id, "nullifier", "666")
            assert.fieldEquals("ValidatedProof", id, "message", "2")
            assert.fieldEquals("ValidatedProof", id, "points", `[${points.join(", ")}]`)
        })
    })

    describe("# Merkle tree depth", () => {
        beforeEach(() => {
            clearStore()
        })

        afterEach(() => {
            clearStore()
        })

        test("Should update depth when adding individual members", () => {
            const groupId = BigInt.fromI32(234)
            const expectedDepths = [0, 1, 2, 2, 3, 3, 3, 3, 4]

            createGroup(createGroupCreatedEvent(groupId))

            assert.fieldEquals("MerkleTree", groupId.toString(), "size", "0")
            assert.fieldEquals("MerkleTree", groupId.toString(), "depth", "0")

            for (let i = 0; i < expectedDepths.length; i += 1) {
                addMember(
                    createMemberAddedEvent(groupId, BigInt.fromI32(i), BigInt.fromI32(i + 123), BigInt.fromI32(i + 999))
                )

                assert.fieldEquals("MerkleTree", groupId.toString(), "size", (i + 1).toString())
                assert.fieldEquals("MerkleTree", groupId.toString(), "depth", expectedDepths[i].toString())
            }
        })

        test("Should update depth when batches cross multiple levels", () => {
            const groupId = BigInt.fromI32(234)
            const batchSizes = [1, 2, 1, 5]
            const expectedDepths = [0, 2, 2, 4]
            let size = 0

            createGroup(createGroupCreatedEvent(groupId))

            for (let i = 0; i < batchSizes.length; i += 1) {
                const identityCommitments = new Array<BigInt>()

                for (let j = 0; j < batchSizes[i]; j += 1) {
                    identityCommitments.push(BigInt.fromI32(size + j + 123))
                }

                addMembers(
                    createMembersAddedEvent(groupId, BigInt.fromI32(size), identityCommitments, BigInt.fromI32(999))
                )

                size += batchSizes[i]

                assert.fieldEquals("MerkleTree", groupId.toString(), "size", size.toString())
                assert.fieldEquals("MerkleTree", groupId.toString(), "depth", expectedDepths[i].toString())
            }
        })

        test("Should preserve depth and size when updating or removing members", () => {
            const groupId = BigInt.fromI32(234)
            const identityCommitments = [BigInt.fromI32(123), BigInt.fromI32(124), BigInt.fromI32(125)]

            createGroup(createGroupCreatedEvent(groupId))
            addMembers(createMembersAddedEvent(groupId, BigInt.fromI32(0), identityCommitments, BigInt.fromI32(999)))
            updateMember(
                createMemberUpdatedEvent(
                    groupId,
                    BigInt.fromI32(0),
                    identityCommitments[0],
                    BigInt.fromI32(126),
                    BigInt.fromI32(1000)
                )
            )

            assert.fieldEquals("MerkleTree", groupId.toString(), "size", "3")
            assert.fieldEquals("MerkleTree", groupId.toString(), "depth", "2")

            removeMember(
                createMemberRemovedEvent(groupId, BigInt.fromI32(2), identityCommitments[2], BigInt.fromI32(1001))
            )

            assert.fieldEquals("MerkleTree", groupId.toString(), "size", "3")
            assert.fieldEquals("MerkleTree", groupId.toString(), "depth", "2")
        })
    })
})
