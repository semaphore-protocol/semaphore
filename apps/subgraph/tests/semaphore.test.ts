import { Address, BigInt, ByteArray } from "@graphprotocol/graph-ts"
import { afterAll, assert, clearStore, describe, test } from "matchstick-as/assembly/index"
import {
    addMember,
    addVerifiedProof,
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
            const merkleTreeDepth = BigInt.fromI32(20)
            const zeroValue = BigInt.fromI32(0)
            const oldAdmin = Address.fromString("0x0000000000000000000000000000000000000000")
            const newAdmin = Address.fromString("0x0000000000000000000000000000000000000001")

            const event1 = createGroupCreatedEvent(groupId, merkleTreeDepth, zeroValue)
            const event2 = createGroupAdminUpdatedEvent(groupId, oldAdmin, newAdmin)

            createGroup(event1)
            updateGroupAdmin(event2)

            assert.entityCount("Group", 1)
            assert.entityCount("MerkleTree", 1)

            assert.fieldEquals("Group", groupId.toString(), "admin", "0x0000000000000000000000000000000000000001")
            assert.fieldEquals("Group", groupId.toString(), "merkleTree", groupId.toString())

            assert.fieldEquals("MerkleTree", groupId.toString(), "depth", "20")
            assert.fieldEquals("MerkleTree", groupId.toString(), "zeroValue", "0")
            assert.fieldEquals("MerkleTree", groupId.toString(), "numberOfLeaves", "0")
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
            assert.fieldEquals("MerkleTree", groupId.toString(), "numberOfLeaves", "1")
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

    describe("# addVerifiedProof", () => {
        test("Should have added a proof", () => {
            const groupId = BigInt.fromI32(234)
            const merkleTreeRoot = BigInt.fromI32(1001)
            const externalNullifier = BigInt.fromI32(1)
            const nullifierHash = BigInt.fromI32(666)
            const signal = BigInt.fromI32(2)
            const id = hash(concat(ByteArray.fromBigInt(nullifierHash), ByteArray.fromBigInt(groupId)))

            const event = createProofVerifiedEvent(groupId, merkleTreeRoot, externalNullifier, nullifierHash, signal)

            addVerifiedProof(event)

            assert.entityCount("VerifiedProof", 1)

            assert.fieldEquals("VerifiedProof", id, "merkleTreeRoot", "1001")
            assert.fieldEquals("VerifiedProof", id, "externalNullifier", "1")
            assert.fieldEquals("VerifiedProof", id, "nullifierHash", "666")
            assert.fieldEquals("VerifiedProof", id, "signal", "2")
            assert.fieldEquals("VerifiedProof", id, "group", groupId.toString())
        })
    })
})
