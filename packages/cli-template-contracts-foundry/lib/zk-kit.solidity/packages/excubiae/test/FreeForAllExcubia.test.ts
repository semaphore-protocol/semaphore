import { expect } from "chai"
import { ethers } from "hardhat"
import { Signer, ZeroAddress, ZeroHash } from "ethers"
import { FreeForAllExcubia, FreeForAllExcubia__factory } from "../typechain-types"

describe("FreeForAllExcubia", function () {
    let FreeForAllExcubiaContract: FreeForAllExcubia__factory
    let freeForAllExcubia: FreeForAllExcubia

    let signer: Signer
    let signerAddress: string

    let gate: Signer
    let gateAddress: string

    before(async function () {
        ;[signer, gate] = await ethers.getSigners()
        signerAddress = await signer.getAddress()
        gateAddress = await gate.getAddress()

        FreeForAllExcubiaContract = await ethers.getContractFactory("FreeForAllExcubia")
        freeForAllExcubia = await FreeForAllExcubiaContract.deploy()
    })

    describe("constructor()", function () {
        it("Should deploy the FreeForAllExcubia contract correctly", async function () {
            expect(freeForAllExcubia).to.not.eq(undefined)
        })
    })

    describe("trait()", function () {
        it("should return the trait of the Excubia contract", async () => {
            expect(await freeForAllExcubia.trait()).to.be.equal("FreeForAll")
        })
    })

    describe("setGate()", function () {
        it("should fail to set the gate when the caller is not the owner", async () => {
            const [, notOwnerSigner] = await ethers.getSigners()

            await expect(freeForAllExcubia.connect(notOwnerSigner).setGate(gateAddress)).to.be.revertedWithCustomError(
                freeForAllExcubia,
                "OwnableUnauthorizedAccount"
            )
        })

        it("should fail to set the gate when the gate address is zero", async () => {
            await expect(freeForAllExcubia.setGate(ZeroAddress)).to.be.revertedWithCustomError(
                freeForAllExcubia,
                "ZeroAddress"
            )
        })

        it("Should set the gate contract address correctly", async function () {
            const tx = await freeForAllExcubia.setGate(gateAddress)
            const receipt = await tx.wait()
            const event = FreeForAllExcubiaContract.interface.parseLog(
                receipt?.logs[0] as unknown as { topics: string[]; data: string }
            ) as unknown as {
                args: {
                    gate: string
                }
            }

            expect(receipt?.status).to.eq(1)
            expect(event.args.gate).to.eq(gateAddress)
            expect(await freeForAllExcubia.gate()).to.eq(gateAddress)
        })

        it("Should fail to set the gate if already set", async function () {
            await expect(freeForAllExcubia.setGate(gateAddress)).to.be.revertedWithCustomError(
                freeForAllExcubia,
                "GateAlreadySet"
            )
        })
    })

    describe("check()", function () {
        it("should check", async () => {
            // `data` parameter value can be whatever (e.g., ZeroHash default).
            await expect(freeForAllExcubia.check(signerAddress, ZeroHash)).to.not.be.reverted

            // check does NOT change the state of the contract (see pass()).
            expect(await freeForAllExcubia.passedPassersby(signerAddress)).to.be.false
        })
    })

    describe("pass()", function () {
        it("should throw when the callee is not the gate", async () => {
            await expect(
                // `data` parameter value can be whatever (e.g., ZeroHash default).
                freeForAllExcubia.connect(signer).pass(signerAddress, ZeroHash)
            ).to.be.revertedWithCustomError(freeForAllExcubia, "GateOnly")
        })

        it("should pass", async () => {
            // `data` parameter value can be whatever (e.g., ZeroHash default).
            const tx = await freeForAllExcubia.connect(gate).pass(signerAddress, ZeroHash)
            const receipt = await tx.wait()
            const event = FreeForAllExcubiaContract.interface.parseLog(
                receipt?.logs[0] as unknown as { topics: string[]; data: string }
            ) as unknown as {
                args: {
                    passerby: string
                    gate: string
                }
            }

            expect(receipt?.status).to.eq(1)
            expect(event.args.passerby).to.eq(signerAddress)
            expect(event.args.gate).to.eq(gateAddress)
            expect(await freeForAllExcubia.passedPassersby(signerAddress)).to.be.true
        })

        it("should prevent to pass twice", async () => {
            await expect(
                // `data` parameter value can be whatever (e.g., ZeroHash default).
                freeForAllExcubia.connect(gate).pass(signerAddress, ZeroHash)
            ).to.be.revertedWithCustomError(freeForAllExcubia, "AlreadyPassed")
        })
    })
})
