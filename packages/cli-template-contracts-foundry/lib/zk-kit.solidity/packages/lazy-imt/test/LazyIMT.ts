import { expect } from "chai"
import { run, network } from "hardhat"
import { poseidon2 } from "poseidon-lite"
import { IMT } from "@zk-kit/imt"
import type { BigNumber } from "ethers"
import { LazyIMT, LazyIMTTest } from "../typechain-types"

const random = () => poseidon2([Math.floor(Math.random() * 2 ** 40), 0])

describe("LazyIMT", () => {
    const SNARK_SCALAR_FIELD = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617")
    let lazyIMTTest: LazyIMTTest
    let lazyIMT: LazyIMT

    beforeEach(async () => {
        const { library, contract } = await run("deploy:imt-test", { library: "LazyIMT", logs: false })

        lazyIMTTest = contract
        lazyIMT = library
    })

    describe("# init", () => {
        it("Should check zero values", async () => {
            expect("0").to.equal((await lazyIMT.defaultZero(0)).toString())

            let hash = poseidon2([BigInt(0), BigInt(0)])

            for (let x = 1; x < 33; x += 1) {
                const v = await lazyIMT.defaultZero(x)
                expect(v.toString()).to.equal(hash.toString())
                hash = poseidon2([hash, hash])
            }

            await expect(lazyIMT.defaultZero(34)).to.be.revertedWith("LazyIMT: defaultZero bad index")
        })

        for (let x = 0; x < 32; x += 1) {
            it(`Should initialize tree with depth ${x}`, async () => {
                {
                    const treeData = await lazyIMTTest.data()

                    expect(treeData.maxIndex).to.equal(0)
                    expect(treeData.numberOfLeaves).to.equal(0)
                }

                await lazyIMTTest.init(x)

                {
                    const treeData = await lazyIMTTest.data()

                    expect(treeData.maxIndex).to.equal(2 ** x - 1)
                    expect(treeData.numberOfLeaves).to.equal(0)
                }
            })
        }

        it("Should fail to init large tree", async () => {
            const treeData = await lazyIMTTest.data()

            expect(treeData.maxIndex).to.equal(0)
            expect(treeData.numberOfLeaves).to.equal(0)

            await expect(lazyIMTTest.init(33)).to.be.revertedWith("LazyIMT: Tree too large")
        })
    })

    describe("# insert", () => {
        for (let depth = 1; depth < 3; depth += 1) {
            it(`Should insert leaves in tree with depth ${depth}`, async () => {
                await lazyIMTTest.init(10)

                // empty root should be H(0, 0)
                expect(await lazyIMTTest.root()).to.equal(poseidon2([BigInt(0), BigInt(0)]))

                const elements = []

                for (let x = 0; x < 2 ** depth - 1; x += 1) {
                    const e = random()

                    elements.push(e)

                    // construct the tree
                    {
                        const targetDepth = Math.max(1, Math.ceil(Math.log2(elements.length)))
                        const merkleTree = new IMT(poseidon2, targetDepth, BigInt(0))
                        for (const _e of elements) {
                            merkleTree.insert(_e)
                        }
                        await lazyIMTTest.insert(e)
                        await lazyIMTTest.benchmarkRoot().then((t) => t.wait())
                        {
                            const root = await lazyIMTTest.root()
                            expect(root.toString()).to.equal(merkleTree.root.toString())
                        }
                        {
                            const root = await lazyIMTTest.dynamicRoot(targetDepth)
                            expect(root.toString()).to.equal(merkleTree.root.toString())
                        }
                    }

                    const treeData = await lazyIMTTest.data()

                    expect(treeData.numberOfLeaves).to.equal(elements.length)

                    for (let y = depth; y < 12; y += 1) {
                        const merkleTree = new IMT(poseidon2, y, BigInt(0))
                        for (const _e of elements) {
                            merkleTree.insert(_e)
                        }
                        const root = await lazyIMTTest.staticRoot(y)
                        expect(root.toString()).to.equal(merkleTree.root.toString())
                    }
                }
            })
        }

        it("Should insert multiple leaves", async () => {
            const depth = 8

            const merkleTree = new IMT(poseidon2, depth, BigInt(0))
            await lazyIMTTest.init(depth)

            for (let x = 0; x < 130; x += 1) {
                const e = random()
                await lazyIMTTest.insert(e)
                merkleTree.insert(e)
            }

            const root = await lazyIMTTest.root()
            expect(root.toString()).to.equal(merkleTree.root.toString())
        })

        it("Should fail to insert too many leaves", async () => {
            const depth = 3

            await lazyIMTTest.init(depth)

            for (let x = 0; x < 2 ** depth - 1; x += 1) {
                await lazyIMTTest.insert(random())
            }

            await expect(lazyIMTTest.insert(random())).to.be.revertedWith("LazyIMT: tree is full")
        })

        it("Should fail to insert leaf outside of field", async () => {
            const depth = 3

            await lazyIMTTest.init(depth)

            await expect(lazyIMTTest.insert(SNARK_SCALAR_FIELD)).to.be.revertedWith(
                "LazyIMT: leaf must be < SNARK_SCALAR_FIELD"
            )
        })
    })

    describe("# update", () => {
        for (let depth = 1; depth < 3; depth += 1) {
            it(`Should update leaves in tree with depth ${depth}`, async () => {
                await lazyIMTTest.init(depth)

                const elements = []

                // runs in ~N^N
                for (let x = 0; x < 2 ** depth - 1; x += 1) {
                    const e = random()

                    elements.push(e)

                    // construct the tree
                    const targetDepth = Math.max(1, Math.ceil(Math.log2(elements.length)))

                    {
                        const merkleTree = new IMT(poseidon2, targetDepth, BigInt(0))

                        for (const _e of elements) {
                            merkleTree.insert(_e)
                        }

                        await lazyIMTTest.insert(e)

                        await lazyIMTTest.benchmarkRoot().then((t) => t.wait())

                        const root = await lazyIMTTest.root()

                        expect(root.toString()).to.equal(merkleTree.root.toString())

                        const treeData = await lazyIMTTest.data()

                        expect(treeData.numberOfLeaves).to.equal(elements.length)
                    }

                    for (let y = 0; y < x; y += 1) {
                        const newE = random()

                        elements.splice(y, 1, newE)

                        await lazyIMTTest.update(newE, y)

                        const merkleTree = new IMT(poseidon2, targetDepth, BigInt(0))

                        for (const _e of elements) {
                            merkleTree.insert(_e)
                        }

                        const root = await lazyIMTTest.root()

                        expect(root.toString()).to.equal(merkleTree.root.toString())

                        const treeData = await lazyIMTTest.data()

                        expect(treeData.numberOfLeaves).to.equal(elements.length)
                    }
                }
            })
        }

        it("Should fail to update invalid leaf index", async () => {
            const depth = 4

            await lazyIMTTest.init(depth)

            for (let x = 0; x < 10; x += 1) {
                await lazyIMTTest.insert(random())
            }

            await expect(lazyIMTTest.update(random(), 10)).to.be.revertedWith("LazyIMT: leaf must exist")
        })

        it("Should fail to update with invalid leaf value", async () => {
            const depth = 3

            await lazyIMTTest.init(depth)

            for (let x = 0; x < 3; x += 1) {
                await lazyIMTTest.insert(random())
            }

            await expect(lazyIMTTest.update(SNARK_SCALAR_FIELD, 0)).to.be.revertedWith(
                "LazyIMT: leaf must be < SNARK_SCALAR_FIELD"
            )
        })
    })

    describe("# reset", () => {
        it("Should reset and reuse tree", async () => {
            const depth = 3

            await lazyIMTTest.init(10)

            {
                const data = await lazyIMTTest.data()

                expect(data.numberOfLeaves).to.equal(0)
            }

            for (let i = 0; i < 3; i += 1) {
                const elements = []

                for (let x = 0; x < 2 ** depth - 1; x += 1) {
                    const e = random()

                    elements.push(e)

                    // construct the tree
                    const targetDepth = Math.max(1, Math.ceil(Math.log2(elements.length)))
                    const merkleTree = new IMT(poseidon2, targetDepth, BigInt(0))

                    for (const _e of elements) {
                        merkleTree.insert(_e)
                    }

                    await lazyIMTTest.insert(e)

                    const root = await lazyIMTTest.root()

                    expect(root.toString()).to.equal(merkleTree.root.toString())

                    const treeData = await lazyIMTTest.data()

                    expect(treeData.numberOfLeaves).to.equal(elements.length)
                }

                await lazyIMTTest.reset()

                {
                    const data = await lazyIMTTest.data()
                    expect(data.numberOfLeaves).to.equal(0)
                }
            }
        })
    })

    describe("# merkleProof", () => {
        // Given a merkle proof (elements and indices) and a leaf, calculates the root
        function calculateRoot(leafIndex: number, leaf: BigNumber, proofElements: BigNumber[]) {
            let hash = leaf
            const proofIndices = []
            for (let x = 0; x < proofElements.length; x += 1) {
                proofIndices.push((leafIndex >> x) & 1)
            }
            for (let i = 0; i < proofElements.length; i += 1) {
                const proofElement = proofElements[i]
                const proofIndex = proofIndices[i]
                if (proofIndex) {
                    hash = poseidon2([proofElement.toString(), hash.toString()])
                } else {
                    hash = poseidon2([hash.toString(), proofElement.toString()])
                }
            }
            return hash
        }

        it("Should produce valid Merke proofs for different trees", async () => {
            // Test different depths (key) and leafs (values)
            const tests: { [key: number]: number[] } = {
                1: [1],
                2: [1, 2],
                5: [6, 7, 8, 15, 16],
                7: [7, 127],
                20: [9, 14, 15, 16, 18, 26, 27, 28, 40, 128, 129]
            }

            // For each depth
            // eslint-disable-next-line guard-for-in
            for (const depth in tests) {
                // For each amount of leafs
                for (const numLeaf of tests[depth]) {
                    // Freeze the state
                    const snapshoot = await network.provider.request({ method: "evm_snapshot", params: [] })

                    // Create the tree
                    await lazyIMTTest.init(depth)
                    const elements = []
                    for (let x = 0; x < numLeaf; x += 1) {
                        const e = random()
                        elements.push(e)
                        await lazyIMTTest.insert(e)
                    }

                    // Get proofs for every leafs and verify against the root
                    for (let leafIndex = 0; leafIndex < numLeaf; leafIndex += 1) {
                        const proofElements = await lazyIMTTest.merkleProofElements(leafIndex, depth)

                        // Calculate the root we arrive at with the proof we got
                        const calculatedRoot = calculateRoot(leafIndex, elements[leafIndex], proofElements)

                        // Get the root from the contract
                        const staticRoot = await lazyIMTTest.staticRoot(depth)

                        // If they match, proof is valid
                        expect(calculatedRoot).to.be.equal(staticRoot)
                    }

                    // Done with test, revert the tree state
                    await network.provider.request({ method: "evm_revert", params: [snapshoot] })
                }
            }
        }).timeout(8 * 60 * 1000)
    })

    it("Should fail to generate out of range static root", async () => {
        await lazyIMTTest.init(10)

        const elements = []
        for (let x = 0; x < 20; x += 1) {
            const e = random()
            elements.push(e)
            await lazyIMTTest.insert(e)
        }
        await expect(lazyIMTTest.staticRoot(4)).to.be.revertedWith("LazyIMT: ambiguous depth")
        await expect(lazyIMTTest.staticRoot(33)).to.be.revertedWith("LazyIMT: depth must be <= MAX_DEPTH")
    })
})
