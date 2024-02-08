import { Group } from "../src"

describe("Group", () => {
    describe("# Group", () => {
        it("Should create a group", () => {
            const group = new Group()

            expect(group.root).toBe("0")
            expect(group.depth).toBe(0)
            expect(group.size).toBe(0)
        })

        it("Should create a group with a list of members", () => {
            const group = new Group([1, 2, 3])

            const group2 = new Group()

            group2.addMember(1)
            group2.addMember(2)
            group2.addMember(3)

            expect(group.root).toContain(group2.root)
            expect(group.depth).toBe(2)
            expect(group.size).toBe(3)
        })
    })

    describe("# addMember", () => {
        it("Should add a member to a group", () => {
            const group = new Group()

            group.addMember(3)

            expect(group.size).toBe(1)
        })
    })

    describe("# addMembers", () => {
        it("Should add many members to a group", () => {
            const group = new Group()

            group.addMembers([1, 3])

            expect(group.size).toBe(2)
        })
    })

    describe("# indexOf", () => {
        it("Should return the index of a member in a group", () => {
            const group = new Group()
            group.addMembers([1, 3])

            const index = group.indexOf(3)

            expect(index).toBe(1)
        })
    })

    describe("# updateMember", () => {
        it("Should update a member in a group", () => {
            const group = new Group()
            group.addMembers([1, 3])

            group.updateMember(0, 1)

            expect(group.size).toBe(2)
            expect(group.members[0]).toBe("1")
        })
    })

    describe("# removeMember", () => {
        it("Should remove a member from a group", () => {
            const group = new Group()
            group.addMembers([1, 3])

            group.removeMember(0)

            expect(group.size).toBe(2)
            expect(group.members[0]).toBe("0")
        })
    })

    describe("# generateMerkleProof", () => {
        it("Should generate a proof of membership", () => {
            const group = new Group()

            group.addMembers([1, 3])

            const proof = group.generateMerkleProof(0)

            expect(proof.leaf).toBe("1")
        })
    })
})
