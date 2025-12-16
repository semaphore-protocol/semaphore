import { LeanIMT, LeanIMTMerkleProof } from "@zk-kit/lean-imt"
import type { BigNumber } from "@zk-kit/utils"
import { poseidon2 } from "poseidon-lite/poseidon2"

/**
 * The Semaphore group is a {@link https://zkkit.pse.dev/classes/_zk_kit_lean_imt.LeanIMT.html | LeanIMT}
 * (Lean Incremental Merkle Tree), i.e. an optimized version of the incremental binary Merkle tree
 * used by Semaphore V3. The new tree does not use zero hashes, and its depth is dynamic.
 * The members of a Semaphore group, or the leaves of a tree, are the identity commitments.
 * Thanks to the properties of Merkle trees, it can be efficiently demonstrated that a group
 * member belongs to the group.
 * This class supports operations such as member addition, update, removal and Merkle proof
 * generation and verification. Groups can also be exported or imported.
 */
export class Group {
    // The {@link https://zkkit.pse.dev/classes/_zk_kit_lean_imt.LeanIMT.html | LeanIMT} instance.
    public leanIMT: LeanIMT

    /**
     * Creates a new instance of the Group. Optionally, a list of identity commitments can
     * be passed as a parameter. Adding members in chunks is more efficient than adding
     * them one by one with the `addMember` function.
     * @param members A list of identity commitments.
     */
    constructor(members: BigNumber[] = []) {
        for (const member of members) {
            if (member === 0n || member === "0") {
                throw new Error("Failed to add member: value cannot be 0")
            }
        }

        this.leanIMT = new LeanIMT((a, b) => poseidon2([a, b]), members.map(BigInt))
    }

    /**
     * Returns the root hash of the tree.
     * @returns The root hash as a bigint.
     */
    public get root(): bigint {
        return this.leanIMT.root ? this.leanIMT.root : 0n
    }

    /**
     * Returns the depth of the tree.
     * @returns The tree depth as a number.
     */
    public get depth(): number {
        return this.leanIMT.depth
    }

    /**
     * Returns the size of the tree (i.e. number of leaves).
     * @returns The tree size as a number.
     */
    public get size(): number {
        return this.leanIMT.size
    }

    /**
     * Returns the members (i.e. identity commitments) of the group.
     * @returns The list of members of the group.
     */
    public get members(): bigint[] {
        return this.leanIMT.leaves
    }

    /**
     * Returns the index of a member. If the member does not exist it returns -1.
     * @param member A member of the group.
     * @returns The index of the member, or -1 if it does not exist.
     */
    public indexOf(member: BigNumber): number {
        return this.leanIMT.indexOf(BigInt(member))
    }

    /**
     * Adds a new member to the group.
     * @param member The new member to be added.
     */
    public addMember(member: BigNumber) {
        if (member === 0n || member === "0") {
            throw new Error("Failed to add member: value cannot be 0")
        }

        this.leanIMT.insert(BigInt(member))
    }

    /**
     * Adds new members to the group.
     * @param members New members.
     */
    public addMembers(members: BigNumber[]) {
        for (const member of members) {
            if (member === 0n || member === "0") {
                throw new Error("Failed to add member: value cannot be 0")
            }
        }

        this.leanIMT.insertMany(members.map(BigInt))
    }

    /**
     * Updates a member in the group.
     * @param index Index of the member to be updated.
     * @param member New member value.
     */
    public updateMember(index: number, member: BigNumber) {
        if (this.members[index] === 0n) {
            throw new Error("Failed to update member: it has been removed")
        }

        this.leanIMT.update(index, BigInt(member))
    }

    /**
     * Removes a member from the group.
     * @param index The index of the member to be removed.
     */
    public removeMember(index: number) {
        if (this.members[index] === 0n) {
            throw new Error("Failed to remove member: it has already been removed")
        }

        this.leanIMT.update(index, 0n)
    }

    /**
     * Creates a proof of membership for a member of the group.
     * @param index The index of the member.
     * @returns The {@link MerkleProof} object.
     */
    public generateMerkleProof(index: number): LeanIMTMerkleProof {
        return this.leanIMT.generateProof(index)
    }

    /**
     * Enables the conversion of the group into a JSON string that
     * can be re-used for future imports. This approach is beneficial for
     * large groups, as it avoids re-calculating the tree hashes.
     * @returns The stringified JSON of the group.
     */
    public export(): string {
        return this.leanIMT.export()
    }

    /**
     * Imports an entire group by initializing the tree without calculating
     * any hashes. Note that it is crucial to ensure the integrity of the
     * exported group.
     * @param nodes The stringified JSON of the group.
     * @returns The {@link Group} instance.
     */
    static import(nodes: string): Group {
        const group = new Group()

        group.leanIMT = LeanIMT.import((a, b) => poseidon2([a, b]), nodes)

        return group
    }
}

export { LeanIMTMerkleProof as MerkleProof }
