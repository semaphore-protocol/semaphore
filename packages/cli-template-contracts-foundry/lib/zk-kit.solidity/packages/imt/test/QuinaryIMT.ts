import { IMT as JSQuinaryIMT } from "@zk-kit/imt"
import { expect } from "chai"
import { run } from "hardhat"
import { poseidon5 } from "poseidon-lite"
import { QuinaryIMT, QuinaryIMTTest } from "../typechain-types"

describe("QuinaryIMT", () => {
    const SNARK_SCALAR_FIELD = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617")
    let quinaryIMT: QuinaryIMT
    let quinaryIMTTest: QuinaryIMTTest
    let jsQuinaryIMT: JSQuinaryIMT

    beforeEach(async () => {
        const { library, contract } = await run("deploy:imt-test", { library: "QuinaryIMT", arity: 5, logs: false })

        quinaryIMT = library
        quinaryIMTTest = contract
        jsQuinaryIMT = new JSQuinaryIMT(poseidon5, 6, 0, 5)
    })

    describe("# init", () => {
        it("Should not create a tree with a depth > 32", async () => {
            const transaction = quinaryIMTTest.init(33)

            await expect(transaction).to.be.revertedWithCustomError(quinaryIMT, "DepthNotSupported")
        })

        it("Should create a tree", async () => {
            await quinaryIMTTest.init(jsQuinaryIMT.depth)

            const { depth } = await quinaryIMTTest.data()

            expect(depth).to.equal(jsQuinaryIMT.depth)
        })
    })

    describe("# insert", () => {
        it("Should not insert a leaf if its value is > SNARK_SCALAR_FIELD", async () => {
            const transaction = quinaryIMTTest.insert(SNARK_SCALAR_FIELD)

            await expect(transaction).to.be.revertedWithCustomError(quinaryIMT, "ValueGreaterThanSnarkScalarField")
        })

        it("Should insert a leaf in a tree", async () => {
            await quinaryIMTTest.init(jsQuinaryIMT.depth)

            jsQuinaryIMT.insert(1)

            await quinaryIMTTest.insert(1)

            const { root } = await quinaryIMTTest.data()

            expect(root).to.equal(jsQuinaryIMT.root)
        })

        it("Should insert 6 leaves in a tree", async () => {
            await quinaryIMTTest.init(jsQuinaryIMT.depth)

            for (let i = 0; i < 6; i += 1) {
                const leaf = i + 1

                jsQuinaryIMT.insert(leaf)
                await quinaryIMTTest.insert(leaf)

                const { root } = await quinaryIMTTest.data()

                expect(root).to.equal(jsQuinaryIMT.root)
            }
        })

        it("Should not insert a leaf if the tree is full", async () => {
            await quinaryIMTTest.init(1)

            for (let i = 0; i < 5; i += 1) {
                await quinaryIMTTest.insert(i + 1)
            }

            const transaction = quinaryIMTTest.insert(3)

            await expect(transaction).to.be.revertedWithCustomError(quinaryIMT, "TreeIsFull")
        })
    })

    describe("# update", () => {
        it("Should not update a leaf if the new value is the same as the old one", async () => {
            await quinaryIMTTest.init(jsQuinaryIMT.depth)
            await quinaryIMTTest.insert(1)

            const transaction = quinaryIMTTest.update(1, 1, [[0, 1, 2, 3]], [0])

            await expect(transaction).to.be.revertedWithCustomError(quinaryIMT, "NewLeafCannotEqualOldLeaf")
        })

        it("Should not update a leaf if its new value is > SNARK_SCALAR_FIELD", async () => {
            await quinaryIMTTest.init(jsQuinaryIMT.depth)
            await quinaryIMTTest.insert(1)

            const transaction = quinaryIMTTest.update(1, SNARK_SCALAR_FIELD, [[0, 1, 2, 3]], [0])

            await expect(transaction).to.be.revertedWithCustomError(quinaryIMT, "ValueGreaterThanSnarkScalarField")
        })

        it("Should not update a leaf if its original value is > SNARK_SCALAR_FIELD", async () => {
            await quinaryIMTTest.init(jsQuinaryIMT.depth)
            await quinaryIMTTest.insert(1)

            const transaction = quinaryIMTTest.update(SNARK_SCALAR_FIELD, 2, [[0, 1, 2, 3]], [0])

            await expect(transaction).to.be.revertedWithCustomError(quinaryIMT, "ValueGreaterThanSnarkScalarField")
        })

        it("Should not update a leaf if the path indices are wrong", async () => {
            await quinaryIMTTest.init(jsQuinaryIMT.depth)
            await quinaryIMTTest.insert(1)

            jsQuinaryIMT.insert(1)
            jsQuinaryIMT.update(0, 2)

            const { pathIndices, siblings } = jsQuinaryIMT.createProof(0)

            pathIndices[0] = 5

            const transaction = quinaryIMTTest.update(1, 2, siblings, pathIndices)

            await expect(transaction).to.be.revertedWithCustomError(quinaryIMT, "WrongMerkleProofPath")
        })

        it("Should not update a leaf if the old leaf is wrong", async () => {
            await quinaryIMTTest.init(jsQuinaryIMT.depth)
            await quinaryIMTTest.insert(1)

            jsQuinaryIMT.insert(1)
            jsQuinaryIMT.update(0, 2)

            const { pathIndices, siblings } = jsQuinaryIMT.createProof(0)

            const transaction = quinaryIMTTest.update(2, 3, siblings, pathIndices)

            await expect(transaction).to.be.revertedWithCustomError(quinaryIMT, "LeafDoesNotExist")
        })

        it("Should update a leaf", async () => {
            await quinaryIMTTest.init(jsQuinaryIMT.depth)
            await quinaryIMTTest.insert(1)

            jsQuinaryIMT.insert(1)
            jsQuinaryIMT.update(0, 2)

            const { pathIndices, siblings } = jsQuinaryIMT.createProof(0)

            await quinaryIMTTest.update(1, 2, siblings, pathIndices)

            const { root } = await quinaryIMTTest.data()

            expect(root).to.equal(jsQuinaryIMT.root)
        })

        it("Should not update a leaf that hasn't been inserted yet", async () => {
            quinaryIMTTest.init(jsQuinaryIMT.depth)

            for (let i = 0; i < 4; i += 1) {
                const leaf = i + 1

                jsQuinaryIMT.insert(leaf)
                await quinaryIMTTest.insert(leaf)
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
            const rootBeforeZeros = jsQuinaryIMT.root

            jsQuinaryIMT.insert(0)
            jsQuinaryIMT.insert(0)
            jsQuinaryIMT.insert(0)

            // The root doesn't change because the tree started full with 0s!
            expect(jsQuinaryIMT.root).to.be.equal(rootBeforeZeros)

            // Now we can make a merkle proof of zero being included at the uninitialized index.
            const { pathIndices, siblings } = jsQuinaryIMT.createProof(6)

            const transaction = quinaryIMTTest.update(0, leaf, siblings, pathIndices)

            await expect(transaction).to.be.revertedWithCustomError(quinaryIMT, "LeafIndexOutOfRange")
        })
    })

    describe("# remove", () => {
        it("Should not remove a leaf if its value is > SNARK_SCALAR_FIELD", async () => {
            const transaction = quinaryIMTTest.remove(SNARK_SCALAR_FIELD, [[0, 1, 2, 3]], [0])

            await expect(transaction).to.be.revertedWithCustomError(quinaryIMT, "ValueGreaterThanSnarkScalarField")
        })

        it("Should not remove a leaf that does not exist", async () => {
            await quinaryIMTTest.init(jsQuinaryIMT.depth)
            await quinaryIMTTest.insert(1)

            jsQuinaryIMT.insert(1)
            jsQuinaryIMT.delete(0)

            const { siblings, pathIndices } = jsQuinaryIMT.createProof(0)

            const transaction = quinaryIMTTest.remove(2, siblings, pathIndices)

            await expect(transaction).to.be.revertedWithCustomError(quinaryIMT, "LeafDoesNotExist")
        })

        it("Should remove a leaf", async () => {
            await quinaryIMTTest.init(jsQuinaryIMT.depth)
            await quinaryIMTTest.insert(1)

            jsQuinaryIMT.insert(1)
            jsQuinaryIMT.delete(0)

            const { pathIndices, siblings } = jsQuinaryIMT.createProof(0)

            await quinaryIMTTest.remove(1, siblings, pathIndices)

            const { root } = await quinaryIMTTest.data()

            expect(root).to.equal(jsQuinaryIMT.root)
        })

        it("Should insert a leaf in a tree after a removal", async () => {
            await quinaryIMTTest.init(jsQuinaryIMT.depth)
            await quinaryIMTTest.insert(1)

            jsQuinaryIMT.insert(1)
            jsQuinaryIMT.delete(0)

            const { pathIndices, siblings } = jsQuinaryIMT.createProof(0)

            await quinaryIMTTest.remove(1, siblings, pathIndices)

            jsQuinaryIMT.insert(2)
            await quinaryIMTTest.insert(2)

            const { root } = await quinaryIMTTest.data()

            expect(root).to.equal(jsQuinaryIMT.root)
        })

        it("Should insert 4 leaves and remove them all", async () => {
            await quinaryIMTTest.init(jsQuinaryIMT.depth)

            for (let i = 0; i < 4; i += 1) {
                const leaf = i + 1

                jsQuinaryIMT.insert(leaf)
                await quinaryIMTTest.insert(leaf)
            }

            for (let i = 0; i < 4; i += 1) {
                jsQuinaryIMT.delete(i)

                const { siblings, pathIndices } = jsQuinaryIMT.createProof(i)

                await quinaryIMTTest.remove(i + 1, siblings, pathIndices)
            }

            const { root } = await quinaryIMTTest.data()

            expect(root).to.equal(jsQuinaryIMT.root)
        })
    })
})
