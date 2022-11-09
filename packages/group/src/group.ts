import { IncrementalMerkleTree, MerkleProof } from "@zk-kit/incremental-merkle-tree"
import { poseidon } from "circomlibjs"
import { Member } from "./types"

export default class Group {
    merkleTree: IncrementalMerkleTree

    /**
     * Initializes the group with the tree depth and the zero value.
     * @param treeDepth Tree depth.
     * @param zeroValue Zero values for zeroes.
     */
    constructor(treeDepth = 20, zeroValue: Member = BigInt(0)) {
        if (treeDepth < 16 || treeDepth > 32) {
            throw new Error("The tree depth must be between 16 and 32")
        }

        this.merkleTree = new IncrementalMerkleTree(poseidon, treeDepth, zeroValue, 2)
    }

    /**
     * Returns the root hash of the tree.
     * @returns Root hash.
     */
    get root(): Member {
        return this.merkleTree.root
    }

    /**
     * Returns the depth of the tree.
     * @returns Tree depth.
     */
    get depth(): number {
        return this.merkleTree.depth
    }

    /**
     * Returns the zero value of the tree.
     * @returns Tree zero value.
     */
    get zeroValue(): Member {
        return this.merkleTree.zeroes[0]
    }

    /**
     * Returns the members (i.e. identity commitments) of the group.
     * @returns List of members.
     */
    get members(): Member[] {
        return this.merkleTree.leaves
    }

    /**
     * Returns the index of a member. If the member does not exist it returns -1.
     * @param member Group member.
     * @returns Index of the member.
     */
    indexOf(member: Member): number {
        return this.merkleTree.indexOf(member)
    }

    /**
     * Adds a new member to the group.
     * @param member New member.
     */
    addMember(member: Member) {
        this.merkleTree.insert(BigInt(member))
    }

    /**
     * Adds new members to the group.
     * @param members New members.
     */
    addMembers(members: Member[]) {
        for (const member of members) {
            this.addMember(member)
        }
    }

    /**
     * Updates a member in the group.
     * @param index Index of the member to be updated.
     * @param member New member value.
     */
    updateMember(index: number, member: Member) {
        this.merkleTree.update(index, member)
    }

    /**
     * Removes a member from the group.
     * @param index Index of the member to be removed.
     */
    removeMember(index: number) {
        this.merkleTree.delete(index)
    }

    /**
     * Creates a proof of membership.
     * @param index Index of the proof's member.
     * @returns Proof object.
     */
    generateMerkleProof(index: number): MerkleProof {
        const merkleProof = this.merkleTree.createProof(index)

        merkleProof.siblings = merkleProof.siblings.map((s) => s[0])

        return merkleProof
    }
}
