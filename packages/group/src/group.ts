import { LeanIMT } from "@zk-kit/imt"
import { poseidon2 } from "poseidon-lite/poseidon2"
import { BigNumberish, MerkleProof } from "./types"

export default class Group {
    leanIMT: LeanIMT

    /**
     * Initializes the group with the group id and the tree depth.
     * @param members List of group members.
     */
    constructor(members: BigNumberish[] = []) {
        this.leanIMT = new LeanIMT((a, b) => poseidon2([a, b]), members.map(BigInt))
    }

    /**
     * Returns the root hash of the tree.
     * @returns Root hash.
     */
    get root(): string | undefined {
        return this.leanIMT.root?.toString()
    }

    /**
     * Returns the depth of the tree.
     * @returns Tree depth.
     */
    get depth(): number {
        return this.leanIMT.depth
    }

    /**
     * Returns the size of the tree (i.e. number of leaves).
     * @returns Tree depth.
     */
    get size(): number {
        return this.leanIMT.size
    }

    /**
     * Returns the members (i.e. identity commitments) of the group.
     * @returns List of members.
     */
    get members(): string[] {
        return this.leanIMT.leaves.map(String)
    }

    /**
     * Returns the index of a member. If the member does not exist it returns -1.
     * @param member Group member.
     * @returns Index of the member.
     */
    indexOf(member: BigNumberish): number {
        return this.leanIMT.indexOf(BigInt(member))
    }

    /**
     * Adds a new member to the group.
     * @param member New member.
     */
    addMember(member: BigNumberish) {
        this.leanIMT.insert(BigInt(member))
    }

    /**
     * Adds new members to the group.
     * @param members New members.
     */
    addMembers(members: BigNumberish[]) {
        this.leanIMT.insertMany(members.map(BigInt))
    }

    /**
     * Updates a member in the group.
     * @param index Index of the member to be updated.
     * @param member New member value.
     */
    updateMember(index: number, member: BigNumberish) {
        this.leanIMT.update(index, BigInt(member))
    }

    /**
     * Removes a member from the group.
     * @param index Index of the member to be removed.
     */
    removeMember(index: number) {
        this.leanIMT.update(index, BigInt(0))
    }

    /**
     * Creates a proof of membership.
     * @param index Index of the proof's member.
     * @returns Proof object.
     */
    generateMerkleProof(_index: number): MerkleProof {
        const { index, leaf, root, siblings } = this.leanIMT.generateProof(_index)

        return {
            index,
            leaf: leaf.toString(),
            root: root.toString(),
            siblings: siblings.map(String)
        }
    }
}
