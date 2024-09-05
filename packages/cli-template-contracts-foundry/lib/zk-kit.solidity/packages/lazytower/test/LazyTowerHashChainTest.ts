import { expect } from "chai"
import { Contract, encodeBytes32String } from "ethers"
import { run } from "hardhat"
import { poseidon2 } from "poseidon-lite"
import ShiftTower from "./utils"

describe("LazyTowerHashChainTest", () => {
    let contract: Contract

    before(async () => {
        contract = await run("deploy:lazytower-test", { logs: false })
    })

    it("Should produce correct levelLengths, digests and digest of digests", async () => {
        const lazyTowerId = encodeBytes32String("test1")

        const N = 150
        for (let i = 0; i < N; i += 1) {
            await contract.add(lazyTowerId, i)
        }

        const [levelLengths, digests, digestOfDigests] = await contract.getDataForProving(lazyTowerId)

        expect(levelLengths).to.equal(0x2112)

        expect(digests[0]).to.equal(
            BigInt("7484852499570635450337779587061833141700590058395918107227385307780465498841")
        )
        expect(digests[1]).to.equal(
            BigInt("18801712394745483811033456933953954791894699812924877968490149877093764724813")
        )
        expect(digests[2]).to.equal(
            BigInt("18495397265763935736123111771752209927150052777598404957994272011704245682779")
        )
        expect(digests[3]).to.equal(
            BigInt("11606235313340788975553986881206148975708550071371494991713397040288897077102")
        )
        for (let i = 4; i < digests.length; i += 1) {
            expect(digests[i]).to.equal(BigInt("0"))
        }

        expect(digestOfDigests).to.equal(
            BigInt("19260615748091768530426964318883829655407684674262674118201416393073357631548")
        )
    })

    // TODO: this times out in CI
    it.skip("Should have the same output as the Javascript fixture", async () => {
        const lazyTowerId = encodeBytes32String("test2")

        const H2 = (a: bigint, b: bigint) => poseidon2([a, b])
        const W = 4
        const shiftTower = ShiftTower(W, (vs: any[]) => vs.reduce(H2))
        for (let i = 0; i < 150; i += 1) {
            shiftTower.add(i)

            const tx = contract.add(lazyTowerId, i)

            // event
            await expect(tx).to.emit(contract, "Add").withArgs(i)

            // levelLengths and digest
            const [levelLengths, digests, digestOfDigests] = await contract.getDataForProving(lazyTowerId)

            expect(levelLengths).to.equal(shiftTower.L.map((l) => l.length).reduce((s, v, lv) => s + (v << (lv * 4))))

            const D = shiftTower.L.map((l: any[]) => l.reduce(H2))
            for (let lv = 0; lv < digests.length; lv += 1) {
                expect(digests[lv]).to.equal(D[lv] ?? 0)
            }

            expect(digestOfDigests).to.equal(D.reverse().reduce(H2))
        }
    })

    it("Should reject values not in the field", async () => {
        const lazyTowerId = encodeBytes32String("test3")

        let item = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495616")

        const tx = contract.add(lazyTowerId, item)
        await expect(tx).to.emit(contract, "Add").withArgs(item)

        item += BigInt(1)
        const tx2 = contract.add(lazyTowerId, item)
        await expect(tx2).to.be.revertedWith("LazyTower: item must be < SNARK_SCALAR_FIELD")
    })
})
