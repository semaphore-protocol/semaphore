import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
    GroupAdminUpdated,
    GroupCreated,
    GroupMerkleTreeDurationUpdated,
    MemberAdded,
    MemberRemoved,
    MemberUpdated,
    ProofVerified
} from "../generated/Semaphore/Semaphore"

export function createGroupCreatedEvent(groupId: BigInt, merkleTreeDepth: BigInt, zeroValue: BigInt): GroupCreated {
    const groupCreatedEvent = changetype<GroupCreated>(newMockEvent())

    groupCreatedEvent.parameters = []

    groupCreatedEvent.parameters.push(new ethereum.EventParam("groupId", ethereum.Value.fromUnsignedBigInt(groupId)))
    groupCreatedEvent.parameters.push(
        new ethereum.EventParam("merkleTreeDepth", ethereum.Value.fromUnsignedBigInt(merkleTreeDepth))
    )
    groupCreatedEvent.parameters.push(
        new ethereum.EventParam("zeroValue", ethereum.Value.fromUnsignedBigInt(zeroValue))
    )

    return groupCreatedEvent
}

export function createGroupAdminUpdatedEvent(groupId: BigInt, oldAdmin: Address, newAdmin: Address): GroupAdminUpdated {
    const groupAdminUpdatedEvent = changetype<GroupAdminUpdated>(newMockEvent())

    groupAdminUpdatedEvent.parameters = []

    groupAdminUpdatedEvent.parameters.push(
        new ethereum.EventParam("groupId", ethereum.Value.fromUnsignedBigInt(groupId))
    )
    groupAdminUpdatedEvent.parameters.push(new ethereum.EventParam("oldAdmin", ethereum.Value.fromAddress(oldAdmin)))
    groupAdminUpdatedEvent.parameters.push(new ethereum.EventParam("newAdmin", ethereum.Value.fromAddress(newAdmin)))

    return groupAdminUpdatedEvent
}

export function createGroupMerkleTreeDurationUpdatedEvent(
    groupId: BigInt,
    oldMerkleTreeDuration: BigInt,
    newMerkleTreeDuration: BigInt
): GroupMerkleTreeDurationUpdated {
    const groupMerkleTreeDurationUpdatedEvent = changetype<GroupMerkleTreeDurationUpdated>(newMockEvent())

    groupMerkleTreeDurationUpdatedEvent.parameters = []

    groupMerkleTreeDurationUpdatedEvent.parameters.push(
        new ethereum.EventParam("groupId", ethereum.Value.fromUnsignedBigInt(groupId))
    )
    groupMerkleTreeDurationUpdatedEvent.parameters.push(
        new ethereum.EventParam("oldMerkleTreeDuration", ethereum.Value.fromUnsignedBigInt(oldMerkleTreeDuration))
    )
    groupMerkleTreeDurationUpdatedEvent.parameters.push(
        new ethereum.EventParam("newMerkleTreeDuration", ethereum.Value.fromUnsignedBigInt(newMerkleTreeDuration))
    )

    return groupMerkleTreeDurationUpdatedEvent
}

export function createMemberAddedEvent(
    groupId: BigInt,
    index: BigInt,
    identityCommitment: BigInt,
    merkleTreeRoot: BigInt
): MemberAdded {
    const memberAddedEvent = changetype<MemberAdded>(newMockEvent())

    memberAddedEvent.parameters = []

    memberAddedEvent.parameters.push(new ethereum.EventParam("groupId", ethereum.Value.fromUnsignedBigInt(groupId)))
    memberAddedEvent.parameters.push(new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index)))
    memberAddedEvent.parameters.push(
        new ethereum.EventParam("identityCommitment", ethereum.Value.fromUnsignedBigInt(identityCommitment))
    )
    memberAddedEvent.parameters.push(
        new ethereum.EventParam("merkleTreeRoot", ethereum.Value.fromUnsignedBigInt(merkleTreeRoot))
    )

    return memberAddedEvent
}

export function createMemberRemovedEvent(
    groupId: BigInt,
    index: BigInt,
    identityCommitment: BigInt,
    merkleTreeRoot: BigInt
): MemberRemoved {
    const memberRemovedEvent = changetype<MemberRemoved>(newMockEvent())

    memberRemovedEvent.parameters = []

    memberRemovedEvent.parameters.push(new ethereum.EventParam("groupId", ethereum.Value.fromUnsignedBigInt(groupId)))
    memberRemovedEvent.parameters.push(new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index)))
    memberRemovedEvent.parameters.push(
        new ethereum.EventParam("identityCommitment", ethereum.Value.fromUnsignedBigInt(identityCommitment))
    )
    memberRemovedEvent.parameters.push(
        new ethereum.EventParam("merkleTreeRoot", ethereum.Value.fromUnsignedBigInt(merkleTreeRoot))
    )

    return memberRemovedEvent
}

export function createMemberUpdatedEvent(
    groupId: BigInt,
    index: BigInt,
    identityCommitment: BigInt,
    newIdentityCommitment: BigInt,
    merkleTreeRoot: BigInt
): MemberUpdated {
    const memberUpdatedEvent = changetype<MemberUpdated>(newMockEvent())

    memberUpdatedEvent.parameters = []

    memberUpdatedEvent.parameters.push(new ethereum.EventParam("groupId", ethereum.Value.fromUnsignedBigInt(groupId)))
    memberUpdatedEvent.parameters.push(new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index)))
    memberUpdatedEvent.parameters.push(
        new ethereum.EventParam("identityCommitment", ethereum.Value.fromUnsignedBigInt(identityCommitment))
    )
    memberUpdatedEvent.parameters.push(
        new ethereum.EventParam("newIdentityCommitment", ethereum.Value.fromUnsignedBigInt(newIdentityCommitment))
    )
    memberUpdatedEvent.parameters.push(
        new ethereum.EventParam("merkleTreeRoot", ethereum.Value.fromUnsignedBigInt(merkleTreeRoot))
    )

    return memberUpdatedEvent
}

export function createProofVerifiedEvent(
    groupId: BigInt,
    merkleTreeRoot: BigInt,
    externalNullifier: BigInt,
    nullifierHash: BigInt,
    signal: BigInt
): ProofVerified {
    const proofVerifiedEvent = changetype<ProofVerified>(newMockEvent())

    proofVerifiedEvent.parameters = []

    proofVerifiedEvent.parameters.push(new ethereum.EventParam("groupId", ethereum.Value.fromUnsignedBigInt(groupId)))
    proofVerifiedEvent.parameters.push(
        new ethereum.EventParam("merkleTreeRoot", ethereum.Value.fromUnsignedBigInt(merkleTreeRoot))
    )
    proofVerifiedEvent.parameters.push(
        new ethereum.EventParam("nullifierHash", ethereum.Value.fromUnsignedBigInt(nullifierHash))
    )
    proofVerifiedEvent.parameters.push(
        new ethereum.EventParam("externalNullifier", ethereum.Value.fromUnsignedBigInt(externalNullifier))
    )

    proofVerifiedEvent.parameters.push(new ethereum.EventParam("signal", ethereum.Value.fromUnsignedBigInt(signal)))

    return proofVerifiedEvent
}
