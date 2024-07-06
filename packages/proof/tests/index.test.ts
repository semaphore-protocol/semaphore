import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { getCurveFromName } from "ffjavascript"
import generateProof, { encodeSolidityCalldata } from "../src/generate-proof"
import verifyProof from "../src/verify-proof"
import { SemaphoreProof } from "../src/types"

describe("Proof", () => {
    const treeDepth = 10

    const message = "Hello world"
    const scope = "Scope"

    const identity = new Identity("secret")

    let curve: any

    beforeAll(async () => {
        curve = await getCurveFromName("bn128")
    })

    afterAll(async () => {
        await curve.terminate()
    })

    describe("# generateProof", () => {
        it("Should not generate a Semaphore proof if the tree depth is not supported", async () => {
            const group = new Group([1n, 2n, identity.commitment])

            const fun = () => generateProof(identity, group, message, scope, 33)

            await expect(fun).rejects.toThrow("tree depth must be")
        })

        it("Should not generate Semaphore proofs if the identity is not part of the group", async () => {
            const group = new Group([1n, 2n])

            const fun = () => generateProof(identity, group, message, scope, treeDepth)

            await expect(fun).rejects.toThrow("does not exist")
        })

        it("Should generate a Semaphore proof", async () => {
            const group = new Group([1n, 2n, identity.commitment])

            const proof = await generateProof(identity, group, message, scope, treeDepth)

            expect(typeof proof).toBe("object")
            expect(BigInt(proof.merkleTreeRoot)).toBe(group.root)
        }, 80000)

        it("Should generate a Semaphore proof passing a Merkle proof instead of a group", async () => {
            const group = new Group([1n, 2n, identity.commitment])

            const proof = await generateProof(identity, group.generateMerkleProof(2), message, scope, treeDepth)

            expect(typeof proof).toBe("object")
            expect(BigInt(proof.merkleTreeRoot)).toBe(group.root)
        }, 80000)

        it("Should generate a Semaphore proof without passing the tree depth", async () => {
            const group = new Group([1n, 2n, identity.commitment])

            const proof = await generateProof(identity, group, message, scope)

            expect(typeof proof).toBe("object")
            expect(BigInt(proof.merkleTreeRoot)).toBe(group.root)
        }, 80000)

        it("Should throw an error because snarkArtifacts is not an object", async () => {
            const group = new Group([1n, 2n, identity.commitment])

            const fun = () => generateProof(identity, group, message, scope, undefined, "hello" as any)

            await expect(fun).rejects.toThrow("is not an object")
        })

        it("Should throw an error because the message value is incorrect", async () => {
            const group = new Group([1n, 2n, identity.commitment])

            const fun = () => generateProof(identity, group, Number.MAX_VALUE, scope, treeDepth)

            await expect(fun).rejects.toThrow("overflow")
        })

        it("Should generate Solidity calldata", async () => {
            // const group = new Group([1n, 2n, identity.commitment])
            // const proof = await generateProof(identity, group, message, scope, treeDepth)
            const proof: SemaphoreProof = {
                merkleTreeDepth: 10,
                merkleTreeRoot: "4990292586352433503726012711155167179034286198473030768981544541070532815155",
                nullifier: "17540473064543782218297133630279824063352907908315494138425986188962403570231",
                message: "32745724963520510550185023804391900974863477733501474067656557556163468591104",
                scope: "37717653415819232215590989865455204849443869931268328771929128739472152723456",
                points: [
                    "216988392541091328019978778083944854625349812094375936727016597375950005514",
                    "15779690157000441619596366087619069088875182651176929820978154151090866411212",
                    "17881842275830165402292989574840162317145169761953585637081137210908827608997",
                    "11983839629948160704068091095892381527491691005960528538165359776472491177918",
                    "12642709254729638753627302480553287872776520556551652706710420818234080472184",
                    "18755021870740626052936738680993416808218050448882984681010395848563633062695",
                    "5784431516683914587405871780432321642200050689936391118836102135779700050988",
                    "12680273727927570632612686161046187327781884899898689548172462614678798355353"
                ]
            }
            const calldata = encodeSolidityCalldata(proof)
            expect(calldata).toBe(
                "0x000000000000000000000000000000000000000000000000000000000000000a0b0867cf8cdf56729afb9fc39a4d7217a3d84f24ef94df01d488ed9f4aec293326c78e51c50cebab7cdc50dfedc868f2328962c48e18c70b869886d4eebdd23748656c6c6f20776f726c6400000000000000000000000000000000000000000053636f7065000000000000000000000000000000000000000000000000000000007acfa2cd6ade31a56bebbb4d06fbc615301c6949c8db6e65b8b60916b0250a22e2fcf5dce59299f89e22c49e74aecc92f10c1211b2e3c5dec48b6dca5cd6cc2788c3998d230cbbe8b462d7580a23abe16d31c762cf7b6fd2a92e0df3be67a51a7e9ce4a47e697d59f8b16cdff9aede44cf7b677d2e080d82700bafb91537be1bf385154a3acb11e55881db4cab833baeba390bed60735ed0399bc6e5f7ac782976f758cad304ada6cb7c0aa0514061a6b19f5d9c78db58ce7df94bc5ba83270cc9df499961559bdf1175650175d0a0c6cfae52222c08201d5da661fb310c2c1c08c7d50a507c9dbb224a284fff7f3198dfe613767dc1a80b7c908954584b99"
            )
        }, 80000)
    })

    describe("# verifyProof", () => {
        it("Should not verify a Semaphore proof if the tree depth is not supported", async () => {
            const group = new Group([1n, 2n, identity.commitment])

            const proof = await generateProof(identity, group, message, scope, treeDepth)

            const fun = () => verifyProof({ ...proof, merkleTreeDepth: 40 })

            await expect(fun).rejects.toThrow("tree depth must be")
        })

        it("Should verify a Semaphore proof", async () => {
            const group = new Group([1n, 2n, identity.commitment])

            const proof = await generateProof(identity, group, message, scope, treeDepth)

            const response = await verifyProof(proof)

            expect(response).toBe(true)
        }, 80_000)
    })
})
