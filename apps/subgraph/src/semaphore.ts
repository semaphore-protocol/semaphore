import { ByteArray, log } from "@graphprotocol/graph-ts"
import {
    GroupAdminUpdated,
    GroupCreated,
    MemberAdded,
    MemberRemoved,
    MemberUpdated,
    ProofVerified
} from "../generated/Semaphore/Semaphore"
import { Member, Group, VerifiedProof, MerkleTree } from "../generated/schema"
import { concat, hash } from "./utils"

/**
 * Creates a new group.
 * @param event Ethereum event emitted when a group is created.
 */
export function createGroup(event: GroupCreated): void {
    log.debug(`GroupCreated event block: {}`, [event.block.number.toString()])

    const group = new Group(event.params.groupId.toString())
    const merkleTree = new MerkleTree(event.params.groupId.toString())

    log.info("Creating group '{}'", [group.id])

    merkleTree.depth = event.params.merkleTreeDepth
    merkleTree.zeroValue = event.params.zeroValue
    merkleTree.numberOfLeaves = 0
    merkleTree.group = group.id

    group.timestamp = event.block.timestamp
    group.merkleTree = merkleTree.id

    merkleTree.save()
    group.save()

    log.info("Group '{}' has been created", [group.id])
}

/**
 * Updates the admin of a group.
 * @param event Ethereum event emitted when a group admin is updated.
 */
export function updateGroupAdmin(event: GroupAdminUpdated): void {
    log.debug(`GroupAdminUpdated event block: {}`, [event.block.number.toString()])

    const group = Group.load(event.params.groupId.toString())

    if (group) {
        log.info("Updating admin '{}' in the group '{}'", [event.params.newAdmin.toString(), group.id])

        group.admin = event.params.newAdmin

        group.save()

        log.info("Admin '{}' of the group '{}' has been updated ", [group.admin!.toString(), group.id])
    }
}

/**
 * Adds a member to a group.
 * @param event Ethereum event emitted when a member is added to a group.
 */
export function addMember(event: MemberAdded): void {
    log.debug(`MemberAdded event block {}`, [event.block.number.toString()])

    const merkleTree = MerkleTree.load(event.params.groupId.toString())

    if (merkleTree) {
        const memberId = hash(
            concat(ByteArray.fromBigInt(event.params.index), ByteArray.fromBigInt(event.params.groupId))
        )
        const member = new Member(memberId)

        log.info("Adding member '{}' in the onchain group '{}'", [member.id, merkleTree.group])

        member.group = merkleTree.group
        member.identityCommitment = event.params.identityCommitment
        member.timestamp = event.block.timestamp
        member.index = merkleTree.numberOfLeaves

        member.save()

        merkleTree.root = event.params.merkleTreeRoot
        merkleTree.numberOfLeaves += 1

        merkleTree.save()

        log.info("Member '{}' of the onchain group '{}' has been added", [member.id, merkleTree.id])
    }
}

/**
 * Updates a member in a group.
 * @param event Ethereum event emitted when a member is removed from a group.
 */
export function updateMember(event: MemberUpdated): void {
    log.debug(`MemberUpdated event block {}`, [event.block.number.toString()])

    const merkleTree = MerkleTree.load(event.params.groupId.toString())

    if (merkleTree) {
        const memberId = hash(
            concat(ByteArray.fromBigInt(event.params.index), ByteArray.fromBigInt(event.params.groupId))
        )
        const member = Member.load(memberId)

        if (member) {
            log.info("Updating member '{}' from the onchain group '{}'", [member.id, merkleTree.group])

            member.identityCommitment = event.params.newIdentityCommitment

            member.save()

            merkleTree.root = event.params.merkleTreeRoot

            merkleTree.save()

            log.info("Member '{}' of the onchain group '{}' has been removed", [member.id, merkleTree.group])
        }
    }
}

/**
 * Removes a member from a group.
 * @param event Ethereum event emitted when a member is removed from a group.
 */
export function removeMember(event: MemberRemoved): void {
    log.debug(`MemberRemoved event block {}`, [event.block.number.toString()])

    const merkleTree = MerkleTree.load(event.params.groupId.toString())

    if (merkleTree) {
        const memberId = hash(
            concat(ByteArray.fromBigInt(event.params.index), ByteArray.fromBigInt(event.params.groupId))
        )
        const member = Member.load(memberId)

        if (member) {
            log.info("Removing member '{}' from the onchain group '{}'", [member.id, merkleTree.group])

            member.identityCommitment = merkleTree.zeroValue

            member.save()

            merkleTree.root = event.params.merkleTreeRoot

            merkleTree.save()

            log.info("Member '{}' of the onchain group '{}' has been removed", [member.id, merkleTree.group])
        }
    }
}

/**
 * Adds a verified proof in a group.
 * @param event Ethereum event emitted when a proof has been verified.
 */
export function addVerifiedProof(event: ProofVerified): void {
    log.debug(`ProofVerified event block {}`, [event.block.number.toString()])

    const group = Group.load(event.params.groupId.toString())

    if (group) {
        const verifiedProofId = hash(
            concat(ByteArray.fromBigInt(event.params.nullifierHash), ByteArray.fromBigInt(event.params.groupId))
        )

        const verifiedProof = new VerifiedProof(verifiedProofId)

        log.info("Adding verified proof with signal '{}' in the onchain group '{}'", [
            event.params.signal.toHexString(),
            group.id
        ])

        verifiedProof.group = group.id
        verifiedProof.signal = event.params.signal
        verifiedProof.merkleTreeRoot = event.params.merkleTreeRoot
        verifiedProof.externalNullifier = event.params.externalNullifier
        verifiedProof.nullifierHash = event.params.nullifierHash
        verifiedProof.timestamp = event.block.timestamp

        verifiedProof.save()

        group.save()

        log.info("Verified proof with signal '{}' in the onchain group '{}' has been added", [
            event.params.signal.toHexString(),
            group.id
        ])
    }
}
