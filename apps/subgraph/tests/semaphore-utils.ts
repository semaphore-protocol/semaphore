import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { newMockEvent } from "matchstick-as"
import {
    GroupAdminUpdated,
    GroupCreated,
    GroupMerkleTreeDurationUpdated,
    MemberAdded,
    MemberRemoved,
    MemberUpdated,
    MembersAdded,
    ProofValidated
} from "../generated/Semaphore/Semaphore"

export function createGroupCreatedEvent(groupId: BigInt): GroupCreated {
    const groupCreatedEvent = changetype<GroupCreated>(newMockEvent())

    groupCreatedEvent.parameters = []

    groupCreatedEvent.parameters.push(new ethereum.EventParam("groupId", ethereum.Value.fromUnsignedBigInt(groupId)))

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

export function createMembersAddedEvent(
    groupId: BigInt,
    startIndex: BigInt,
    identityCommitments: BigInt[],
    merkleTreeRoot: BigInt
): MembersAdded {
    const membersAddedEvent = changetype<MembersAdded>(newMockEvent())

    membersAddedEvent.parameters = []

    membersAddedEvent.parameters.push(new ethereum.EventParam("groupId", ethereum.Value.fromUnsignedBigInt(groupId)))
    membersAddedEvent.parameters.push(
        new ethereum.EventParam("startIndex", ethereum.Value.fromUnsignedBigInt(startIndex))
    )
    membersAddedEvent.parameters.push(
        new ethereum.EventParam("identityCommitments", ethereum.Value.fromUnsignedBigIntArray(identityCommitments))
    )
    membersAddedEvent.parameters.push(
        new ethereum.EventParam("merkleTreeRoot", ethereum.Value.fromUnsignedBigInt(merkleTreeRoot))
    )

    return membersAddedEvent
}

export function createProofVerifiedEvent(
    groupId: BigInt,
    merkleTreeDepth: BigInt,
    merkleTreeRoot: BigInt,
    nullifier: BigInt,
    message: BigInt,
    scope: BigInt,
    points: BigInt[]
): ProofValidated {
    const proofValidatedEvent = changetype<ProofValidated>(newMockEvent())

    proofValidatedEvent.parameters = []

    proofValidatedEvent.parameters.push(new ethereum.EventParam("groupId", ethereum.Value.fromUnsignedBigInt(groupId)))
    proofValidatedEvent.parameters.push(
        new ethereum.EventParam("merkleTreeDepth", ethereum.Value.fromUnsignedBigInt(merkleTreeDepth))
    )
    proofValidatedEvent.parameters.push(
        new ethereum.EventParam("merkleTreeRoot", ethereum.Value.fromUnsignedBigInt(merkleTreeRoot))
    )
    proofValidatedEvent.parameters.push(
        new ethereum.EventParam("nullifier", ethereum.Value.fromUnsignedBigInt(nullifier))
    )
    proofValidatedEvent.parameters.push(new ethereum.EventParam("message", ethereum.Value.fromUnsignedBigInt(message)))
    proofValidatedEvent.parameters.push(new ethereum.EventParam("scope", ethereum.Value.fromUnsignedBigInt(scope)))
    proofValidatedEvent.parameters.push(
        new ethereum.EventParam("points", ethereum.Value.fromUnsignedBigIntArray(points))
    )

    return proofValidatedEvent
}
