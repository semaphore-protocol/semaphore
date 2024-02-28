import { Fr } from "@aztec/bb.js"
import Group from "./group"
import hash from "./hash"

describe("Group", () => {
    describe("# Group", () => {
        it("Should create a group", async () => {
            const group = new Group(1)
            await group.init()

            expect(group.id).toBe(1)
            expect(group.root.toString()).toContain("26a9d")
            expect(group.depth).toBe(20)
            expect(group.zeroValue).toBe(hash(1))
            expect(group.members).toHaveLength(0)
        })

        it("Should not create a group with a wrong tree depth", () => {
            const fun = () => new Group(1, 33)

            expect(fun).toThrow("The tree depth must be between 16 and 32")
        })

        it("Should create a group with a different tree depth", async () => {
            const group = new Group(1, 32)
            await group.init()

            expect(group.root.toString()).toContain("29e54d")
            expect(group.depth).toBe(32)
            expect(group.zeroValue).toBe(hash(1))
            expect(group.members).toHaveLength(0)
        })

        it("Should create a group with a list of members", async () => {
            const group = new Group(2, 20)
            await group.init([Fr.fromString("0x01"), Fr.fromString("0x02"), Fr.fromString("0x03")])

            const group2 = new Group(2, 20)
            await group2.init()

            group2.addMember(Fr.fromString("0x01"))
            group2.addMember(Fr.fromString("0x02"))
            group2.addMember(Fr.fromString("0x03"))

            expect(group.root.toString()).toContain(group2.root.toString())
            expect(group.depth).toBe(20)
            expect(group.zeroValue).toBe(hash(2))
            expect(group.members).toHaveLength(3)
        })
    })

    describe("# addMember", () => {
        it("Should add a member to a group", async () => {
            const group = new Group(1)
            await group.init()

            group.addMember(Fr.fromString("0x03"))

            expect(group.members).toHaveLength(1)
        })
    })

    describe("# addMembers", () => {
        it("Should add many members to a group", async () => {
            const group = new Group(1)
            await group.init()

            group.addMembers([Fr.fromString("0x01"), Fr.fromString("0x03")])

            expect(group.members).toHaveLength(2)
        })
    })

    describe("# indexOf", () => {
        it("Should return the index of a member in a group", async () => {
            const group = new Group(1)
            await group.init()
            group.addMembers([Fr.fromString("0x01"), Fr.fromString("0x03")])

            const index = group.indexOf(Fr.fromString("0x03"))

            expect(index).toBe(1)
        })
    })

    describe("# updateMember", () => {
        it("Should update a member in a group", async () => {
            const group = new Group(1)
            await group.init()

            group.addMembers([Fr.fromString("0x01"), Fr.fromString("0x03")])

            group.updateMember(0, Fr.fromString("0x01"))

            expect(group.members).toHaveLength(2)
            expect(group.members[0]).toBe("0x01")
        })
    })

    describe("# removeMember", () => {
        it("Should remove a member from a group", async () => {
            const group = new Group(1)
            await group.init()

            group.addMembers([Fr.fromString("0x01"), Fr.fromString("0x03")])

            group.removeMember(0)

            expect(group.members).toHaveLength(2)
            expect(group.members[0]).toBe(group.zeroValue)
        })
    })

    describe("# generateMerkleProof", () => {
        it("Should generate a proof of membership", async () => {
            const group = new Group(1)
            await group.init()
            group.addMembers([Fr.fromString("0x01"), Fr.fromString("0x03")])

            const proof = group.generateMerkleProof(0)

            expect(proof.leaf).toBe("0x01")
        })
    })
})
