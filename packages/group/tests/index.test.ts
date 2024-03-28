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
            const group = new Group([1n, 2n, 3n])

            const group2 = new Group()

            group2.addMember(1n)
            group2.addMember(2n)
            group2.addMember(3n)

            expect(group.root).toContain(group2.root)
            expect(group.depth).toBe(2)
            expect(group.size).toBe(3)
        })
    })

    describe("# addMember", () => {
        it("Should add a member to a group", () => {
            const group = new Group()

            group.addMember(3n)

            expect(group.size).toBe(1)
        })
    })

    describe("# addMembers", () => {
        it("Should add many members to a group", () => {
            const group = new Group()

            group.addMembers([1n, 3n])

            expect(group.size).toBe(2)
        })
    })

    describe("# indexOf", () => {
        it("Should return the index of a member in a group", () => {
            const group = new Group()
            group.addMembers([1n, 3n])

            const index = group.indexOf(3n)

            expect(index).toBe(1)
        })
    })

    describe("# updateMember", () => {
        it("Should update a member in a group", () => {
            const group = new Group()
            group.addMembers([1n, 3n])

            group.updateMember(0, 1n)

            expect(group.size).toBe(2)
            expect(group.members[0]).toBe("1")
        })
    })

    describe("# removeMember", () => {
        it("Should remove a member from a group", () => {
            const group = new Group()
            group.addMembers([1n, 3n])

            group.removeMember(0)

            expect(group.size).toBe(2)
            expect(group.members[0]).toBe("0")
        })
    })

    describe("# generateMerkleProof", () => {
        it("Should generate a proof of membership", () => {
            const group = new Group()

            group.addMembers([1n, 3n])

            const proof = group.generateMerkleProof(0)

            expect(proof.leaf).toBe("1")
        })
    })

    describe("# export", () => {
        it("Should export a group", () => {
            const group = new Group([1n, 2n, 3n])

            const exportedGroup = group.export()

            expect(typeof exportedGroup).toBe("string")
            expect(JSON.parse(exportedGroup)).toHaveLength(3)
            expect(JSON.parse(exportedGroup)[0]).toHaveLength(3)
        })
    })

    describe("# import", () => {
        it("Should import a group", () => {
            const group1 = new Group([1n, 2n, 3n])
            const exportedGroup = group1.export()

            const group2 = Group.import(exportedGroup)

            group1.addMember(4n)
            group2.addMember(4n)

            expect(group2.depth).toBe(group1.depth)
            expect(group2.size).toBe(group1.size)
            expect(group2.root).toBe(group1.root)
        })
    })
})
