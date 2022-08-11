import Group from "./group"

describe("Group", () => {
    describe("# Group", () => {
        it("Should create a group", () => {
            const group = new Group()

            expect(group.root.toString()).toContain("150197")
            expect(group.depth).toBe(20)
            expect(group.zeroValue).toBe(BigInt(0))
            expect(group.members).toHaveLength(0)
        })

        it("Should not create a group with a wrong tree depth", () => {
            const fun = () => new Group(33)

            expect(fun).toThrow("The tree depth must be between 16 and 32")
        })

        it("Should create a group with different parameters", () => {
            const group = new Group(32, BigInt(1))

            expect(group.root.toString()).toContain("640470")
            expect(group.depth).toBe(32)
            expect(group.zeroValue).toBe(BigInt(1))
            expect(group.members).toHaveLength(0)
        })
    })

    describe("# addMember", () => {
        it("Should add a member to a group", () => {
            const group = new Group()

            group.addMember(BigInt(3))

            expect(group.members).toHaveLength(1)
        })
    })

    describe("# addMembers", () => {
        it("Should add many members to a group", () => {
            const group = new Group()

            group.addMembers([BigInt(1), BigInt(3)])

            expect(group.members).toHaveLength(2)
        })
    })

    describe("# indexOf", () => {
        it("Should return the index of a member in a group", () => {
            const group = new Group()
            group.addMembers([BigInt(1), BigInt(3)])

            const index = group.indexOf(BigInt(3))

            expect(index).toBe(1)
        })
    })

    describe("# removeMember", () => {
        it("Should remove a member from a group", () => {
            const group = new Group()
            group.addMembers([BigInt(1), BigInt(3)])

            group.removeMember(0)

            expect(group.members).toHaveLength(2)
            expect(group.members[0]).toBe(group.zeroValue)
        })
    })

    describe("# generateProofOfMembership", () => {
        it("Should generate a proof of membership", () => {
            const group = new Group()
            group.addMembers([BigInt(1), BigInt(3)])

            const proof = group.generateProofOfMembership(0)

            expect(proof.leaf).toBe(BigInt(1))
        })
    })
})
