import { IncrementalMerkleTree, MerkleProof } from "@zk-kit/incremental-merkle-tree"
import { BarretenbergSync, Fr } from "@aztec/bb.js"
// import { cpus } from "os"

import hash from "./hash"
import { BigNumberish } from "./types"

export default class Group {
    private _id: BigNumberish

    merkleTree: IncrementalMerkleTree | null = null
    private bb: BarretenbergSync | null = null

    /**
     * Initializes the group with the group id and the tree depth.
     * @param id Group identifier.
     * @param treeDepth Tree depth.
     * @param members List of group members.
     */
    constructor(id: BigNumberish, private treeDepth = 20) {
        if (treeDepth < 16 || treeDepth > 32) {
            throw new Error("The tree depth must be between 16 and 32")
        }
        this._id = id
    }

    /**
     *
     * Inits helper functions
     *
     */
    async init(members: Fr[] = []) {
        console.log("members", members)
        const bb = await BarretenbergSync.new()
        this.merkleTree = new IncrementalMerkleTree(
            (values) => bb.poseidonHash(values),
            this.treeDepth,
            hash(this._id),
            2,
            members.map((m) => m.toString())
        )
    }

    /**
     * Returns the id of the group.
     * @returns Group id.
     */
    get id(): BigNumberish {
        return this._id
    }

    /**
     * Returns the root hash of the tree.
     * @returns Root hash.
     */
    get root(): BigNumberish {
        return this.merkleTree!.root
    }

    /**
     * Returns the depth of the tree.
     * @returns Tree depth.
     */
    get depth(): number {
        return this.merkleTree!.depth
    }

    /**
     * Returns the zero value of the tree.
     * @returns Tree zero value.
     */
    get zeroValue(): BigNumberish {
        return this.merkleTree!.zeroes[0]
    }

    /**
     * Returns the members (i.e. identity commitments) of the group.
     * @returns List of members.
     */
    get members(): BigNumberish[] {
        return this.merkleTree!.leaves
    }

    /**
     * Returns the index of a member. If the member does not exist it returns -1.
     * @param member Group member.
     * @returns Index of the member.
     */
    indexOf(member: Fr): number {
        return this.merkleTree!.indexOf(member.toString())
    }

    /**
     * Adds a new member to the group.
     * @param member New member.
     */
    addMember(member: Fr) {
        this.merkleTree!.insert(member.toString())
    }

    /**
     * Adds new members to the group.
     * @param members New members.
     * @deprecated Use the new class parameter to add a list of members.
     */
    addMembers(members: Fr[]) {
        for (const member of members) {
            this.addMember(member)
        }
    }

    /**
     * Updates a member in the group.
     * @param index Index of the member to be updated.
     * @param member New member value.
     */
    updateMember(index: number, member: Fr) {
        this.merkleTree!.update(index, member.toString())
    }

    /**
     * Removes a member from the group.
     * @param index Index of the member to be removed.
     */
    removeMember(index: number) {
        this.merkleTree!.delete(index)
    }

    /**
     * Creates a proof of membership.
     * @param index Index of the proof's member.
     * @returns Proof object.
     */
    generateMerkleProof(index: number): MerkleProof {
        const merkleProof = this.merkleTree!.createProof(index)

        merkleProof.siblings = merkleProof.siblings.map((s) => s[0])

        return merkleProof
    }
}
