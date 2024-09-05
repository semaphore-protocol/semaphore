import { IMT as JSBinaryIMT } from "@zk-kit/imt"
import { expect } from "chai"
import { run } from "hardhat"
import { poseidon2 } from "poseidon-lite"
import { BinaryIMT, BinaryIMTTest } from "../typechain-types"

describe("BinaryIMT", () => {
    const SNARK_SCALAR_FIELD = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617")
    let binaryIMT: BinaryIMT
    let binaryIMTTest: BinaryIMTTest
    let jsBinaryIMT: JSBinaryIMT

    beforeEach(async () => {
        const { library, contract } = await run("deploy:imt-test", { library: "BinaryIMT", logs: false })

        binaryIMT = library
        binaryIMTTest = contract
        jsBinaryIMT = new JSBinaryIMT(poseidon2, 6, 0, 2)
    })

    describe("# init", () => {
        it("Should not create a tree with a depth > 32", async () => {
            const transaction = binaryIMTTest.init(33)

            await expect(transaction).to.be.revertedWithCustomError(binaryIMT, "DepthNotSupported")
        })

        it("Should create a tree", async () => {
            await binaryIMTTest.init(jsBinaryIMT.depth)

            const { depth } = await binaryIMTTest.data()

            expect(depth).to.equal(jsBinaryIMT.depth)
        })

        it("Should create a tree with default zeroes", async () => {
            await binaryIMTTest.initWithDefaultZeroes(jsBinaryIMT.depth)

            const { depth, useDefaultZeroes } = await binaryIMTTest.data()

            expect(depth).to.equal(jsBinaryIMT.depth)
            expect(useDefaultZeroes).to.equal(true)
        })
    })

    describe("# insert", () => {
        it("Should not insert a leaf if its value is > SNARK_SCALAR_FIELD", async () => {
            const transaction = binaryIMTTest.insert(SNARK_SCALAR_FIELD)

            await expect(transaction).to.be.revertedWithCustomError(binaryIMT, "ValueGreaterThanSnarkScalarField")
        })

        it("Should insert a leaf in a tree", async () => {
            await binaryIMTTest.init(jsBinaryIMT.depth)

            jsBinaryIMT.insert(1)

            await binaryIMTTest.insert(1)

            const { root } = await binaryIMTTest.data()

            expect(root).to.equal(jsBinaryIMT.root)
        })

        it("Should insert a leaf in a tree with default zeroes", async () => {
            await binaryIMTTest.init(jsBinaryIMT.depth)

            jsBinaryIMT.insert(1)

            await binaryIMTTest.insert(1)

            const { root } = await binaryIMTTest.data()

            expect(root).to.equal(jsBinaryIMT.root)
        })

        it("Should insert 4 leaves in a tree", async () => {
            await binaryIMTTest.init(jsBinaryIMT.depth)

            for (let i = 0; i < 4; i += 1) {
                const leaf = i + 1

                jsBinaryIMT.insert(leaf)
                await binaryIMTTest.insert(leaf)

                const { root } = await binaryIMTTest.data()

                expect(root).to.equal(jsBinaryIMT.root)
            }
        })

        it("Should insert 4 leaves in a default zeroes tree", async () => {
            const jsBinaryIMT = new JSBinaryIMT(poseidon2, 32, 0)

            await binaryIMTTest.initWithDefaultZeroes(jsBinaryIMT.depth)

            for (let x = 0; x < 4; x += 1) {
                const leaf = (x + 10) ** 2

                jsBinaryIMT.insert(leaf)
                await binaryIMTTest.insert(leaf)

                const { root } = await binaryIMTTest.data()

                expect(root).to.equal(jsBinaryIMT.root)
            }
        })

        it("Should not insert a leaf if the tree is full", async () => {
            await binaryIMTTest.init(1)
            await binaryIMTTest.insert(1)
            await binaryIMTTest.insert(2)

            const transaction = binaryIMTTest.insert(3)

            await expect(transaction).to.be.revertedWithCustomError(binaryIMT, "TreeIsFull")
        })
    })

    describe("# update", () => {
        it("Should not update a leaf if the new value is the same as the old one", async () => {
            await binaryIMTTest.init(jsBinaryIMT.depth)
            await binaryIMTTest.insert(1)

            const transaction = binaryIMTTest.update(1, 1, [0, 1], [0, 1])

            await expect(transaction).to.be.revertedWithCustomError(binaryIMT, "NewLeafCannotEqualOldLeaf")
        })

        it("Should not update a leaf if its new value is > SNARK_SCALAR_FIELD", async () => {
            await binaryIMTTest.init(jsBinaryIMT.depth)
            await binaryIMTTest.insert(1)

            const transaction = binaryIMTTest.update(1, SNARK_SCALAR_FIELD, [0, 1], [0, 1])

            await expect(transaction).to.be.revertedWithCustomError(binaryIMT, "ValueGreaterThanSnarkScalarField")
        })

        it("Should not update a leaf if its original value is > SNARK_SCALAR_FIELD", async () => {
            await binaryIMTTest.init(jsBinaryIMT.depth)
            await binaryIMTTest.insert(1)

            const transaction = binaryIMTTest.update(SNARK_SCALAR_FIELD, 2, [0, 1], [0, 1])

            await expect(transaction).to.be.revertedWithCustomError(binaryIMT, "ValueGreaterThanSnarkScalarField")
        })

        it("Should not update a leaf if the path indices are wrong", async () => {
            await binaryIMTTest.init(jsBinaryIMT.depth)
            await binaryIMTTest.insert(1)

            jsBinaryIMT.insert(1)
            jsBinaryIMT.update(0, 2)

            const { pathIndices, siblings } = jsBinaryIMT.createProof(0)

            pathIndices[0] = 2

            const transaction = binaryIMTTest.update(
                1,
                2,
                siblings.map((s) => s[0]),
                pathIndices
            )

            await expect(transaction).to.be.revertedWithCustomError(binaryIMT, "WrongMerkleProofPath")
        })

        it("Should not update a leaf if the old leaf is wrong", async () => {
            await binaryIMTTest.init(jsBinaryIMT.depth)
            await binaryIMTTest.insert(1)

            jsBinaryIMT.insert(1)
            jsBinaryIMT.update(0, 2)

            const { pathIndices, siblings } = jsBinaryIMT.createProof(0)

            const transaction = binaryIMTTest.update(
                2,
                3,
                siblings.map((s) => s[0]),
                pathIndices
            )

            await expect(transaction).to.be.revertedWithCustomError(binaryIMT, "LeafDoesNotExist")
        })

        it("Should update a leaf", async () => {
            await binaryIMTTest.init(jsBinaryIMT.depth)
            await binaryIMTTest.insert(1)

            jsBinaryIMT.insert(1)
            jsBinaryIMT.update(0, 2)

            const { pathIndices, siblings } = jsBinaryIMT.createProof(0)

            await binaryIMTTest.update(
                1,
                2,
                siblings.map((s) => s[0]),
                pathIndices
            )

            const { root } = await binaryIMTTest.data()

            expect(root).to.equal(jsBinaryIMT.root)
        })

        it("Should not update a leaf that hasn't been inserted yet", async () => {
            binaryIMTTest.init(jsBinaryIMT.depth)

            for (let i = 0; i < 4; i += 1) {
                const leaf = i + 1

                jsBinaryIMT.insert(leaf)
                await binaryIMTTest.insert(leaf)
            }

            // We're going to try to update leaf 7, despite there only being 4 leaves in the tree.
            const leaf = 42069

            // Note that we can insert zeros into the js library tree and the root won't change!
            // that's because we use the zeros optimization to calculate the roots efficiently.
            // technically speaking, there isn't an "empty" tree, there is only a tree that is
            // entirely full of the zero value at every index. Therefore inserting the zero value
            // at any point into an incremental merkle tree doesn't change it's root, because
            // that is already the data the root was calculated from previously. In principle,
            // we can update any leaf that hasn't been inserted yet using this method.
            const rootBeforeZeros = jsBinaryIMT.root

            jsBinaryIMT.insert(0)
            jsBinaryIMT.insert(0)
            jsBinaryIMT.insert(0)

            // The root doesn't change because the tree started full with 0s!
            expect(jsBinaryIMT.root).to.be.equal(rootBeforeZeros)

            // Now we can make a merkle proof of zero being included at the uninitialized index.
            const { pathIndices, siblings } = jsBinaryIMT.createProof(6)

            const transaction = binaryIMTTest.update(
                0,
                leaf,
                siblings.map((s) => s[0]),
                pathIndices
            )

            await expect(transaction).to.be.revertedWithCustomError(binaryIMT, "LeafIndexOutOfRange")
        })
    })

    describe("# remove", () => {
        it("Should not remove a leaf if its value is > SNARK_SCALAR_FIELD", async () => {
            const transaction = binaryIMTTest.remove(SNARK_SCALAR_FIELD, [0, 1], [0, 1])

            await expect(transaction).to.be.revertedWithCustomError(binaryIMT, "ValueGreaterThanSnarkScalarField")
        })

        it("Should not remove a leaf that does not exist", async () => {
            await binaryIMTTest.init(jsBinaryIMT.depth)
            await binaryIMTTest.insert(1)

            jsBinaryIMT.insert(1)
            jsBinaryIMT.delete(0)

            const { siblings, pathIndices } = jsBinaryIMT.createProof(0)

            const transaction = binaryIMTTest.remove(
                2,
                siblings.map((s) => s[0]),
                pathIndices
            )

            await expect(transaction).to.be.revertedWithCustomError(binaryIMT, "LeafDoesNotExist")
        })

        it("Should remove a leaf", async () => {
            await binaryIMTTest.init(jsBinaryIMT.depth)
            await binaryIMTTest.insert(1)

            jsBinaryIMT.insert(1)
            jsBinaryIMT.delete(0)

            const { pathIndices, siblings } = jsBinaryIMT.createProof(0)

            await binaryIMTTest.remove(
                1,
                siblings.map((s) => s[0]),
                pathIndices
            )

            const { root } = await binaryIMTTest.data()

            expect(root).to.equal(jsBinaryIMT.root)
        })

        it("Should remove a leaf in a tree with default zeroes", async () => {
            await binaryIMTTest.initWithDefaultZeroes(jsBinaryIMT.depth)
            await binaryIMTTest.insert(1)

            jsBinaryIMT.insert(1)
            jsBinaryIMT.delete(0)

            const { siblings, pathIndices } = jsBinaryIMT.createProof(0)

            await binaryIMTTest.remove(
                1,
                siblings.map((s) => s[0]),
                pathIndices
            )

            const { root } = await binaryIMTTest.data()

            expect(root).to.equal(jsBinaryIMT.root)
        })

        it("Should insert a leaf in a tree after a removal", async () => {
            await binaryIMTTest.init(jsBinaryIMT.depth)
            await binaryIMTTest.insert(1)

            jsBinaryIMT.insert(1)
            jsBinaryIMT.delete(0)

            const { pathIndices, siblings } = jsBinaryIMT.createProof(0)

            await binaryIMTTest.remove(
                1,
                siblings.map((s) => s[0]),
                pathIndices
            )

            jsBinaryIMT.insert(2)
            await binaryIMTTest.insert(2)

            const { root } = await binaryIMTTest.data()

            expect(root).to.equal(jsBinaryIMT.root)
        })

        it("Should insert 4 leaves and remove them all", async () => {
            await binaryIMTTest.init(jsBinaryIMT.depth)

            for (let i = 0; i < 4; i += 1) {
                const leaf = i + 1

                jsBinaryIMT.insert(leaf)
                await binaryIMTTest.insert(leaf)
            }

            for (let i = 0; i < 4; i += 1) {
                jsBinaryIMT.delete(i)

                const { siblings, pathIndices } = jsBinaryIMT.createProof(i)

                await binaryIMTTest.remove(
                    i + 1,
                    siblings.map((s) => s[0]),
                    pathIndices
                )
            }

            const { root } = await binaryIMTTest.data()

            expect(root).to.equal(jsBinaryIMT.root)
        })
    })
})
