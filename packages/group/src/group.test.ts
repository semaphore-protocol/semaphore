import Group from "./group"
import hash from "./hash"

describe("Group", () => {
    describe("# Group", () => {
        it("Should create a group", () => {
            const group = new Group(1)

            expect(group.id).toBe(1)
            expect(group.root.toString()).toContain("103543")
            expect(group.depth).toBe(20)
            expect(group.zeroValue).toBe(hash(1))
            expect(group.members).toHaveLength(0)
        })

        it("Should not create a group with a wrong tree depth", () => {
            const fun = () => new Group(1, 33)

            expect(fun).toThrow("The tree depth must be between 16 and 32")
        })

        it("Should create a group with a different tree depth", () => {
            const group = new Group(1, 32)

            expect(group.root.toString()).toContain("460373")
            expect(group.depth).toBe(32)
            expect(group.zeroValue).toBe(hash(1))
            expect(group.members).toHaveLength(0)
        })

        it("Should create a group with a list of members", () => {
            const group = new Group(2, 20, [1, 2, 3])

            const group2 = new Group(2, 20)

            group2.addMember(1)
            group2.addMember(2)
            group2.addMember(3)

            expect(group.root.toString()).toContain(group2.root.toString())
            expect(group.depth).toBe(20)
            expect(group.zeroValue).toBe(hash(2))
            expect(group.members).toHaveLength(3)
        })
    })

    describe("# addMember", () => {
        it("Should add a member to a group", () => {
            const group = new Group(1)

            group.addMember(BigInt(3))

            expect(group.members).toHaveLength(1)
        })
    })

    describe("# addMembers", () => {
        it("Should add many members to a group", () => {
            const group = new Group(1)

            group.addMembers([BigInt(1), BigInt(3)])

            expect(group.members).toHaveLength(2)
        })
    })

    describe("# indexOf", () => {
        it("Should return the index of a member in a group", () => {
            const group = new Group(1)
            group.addMembers([BigInt(1), BigInt(3)])

            const index = group.indexOf(BigInt(3))

            expect(index).toBe(1)
        })
    })

    describe("# updateMember", () => {
        it("Should update a member in a group", () => {
            const group = new Group(1)
            group.addMembers([BigInt(1), BigInt(3)])

            group.updateMember(0, BigInt(1))

            expect(group.members).toHaveLength(2)
            expect(group.members[0]).toBe(BigInt(1))
        })
    })

    describe("# removeMember", () => {
        it("Should remove a member from a group", () => {
            const group = new Group(1)
            group.addMembers([BigInt(1), BigInt(3)])

            group.removeMember(0)

            expect(group.members).toHaveLength(2)
            expect(group.members[0]).toBe(group.zeroValue)
        })
    })

    describe("# generateMerkleProof", () => {
        it("Should generate a proof of membership", () => {
            const group = new Group(1)
            group.addMembers([BigInt(1), BigInt(3)])

            const proof = group.generateMerkleProof(0)

            expect(proof.leaf).toBe(BigInt(1))
        })
    })
})
