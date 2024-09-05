import { expect } from "chai"
import { ethers } from "hardhat"
import { AbiCoder, Signer, ZeroAddress, toBeHex, zeroPadBytes } from "ethers"
import { HatsExcubia, HatsExcubia__factory, MockHats, MockHats__factory } from "../typechain-types"

describe("HatsExcubia", function () {
    let MockHatsContract: MockHats__factory
    let HatsExcubiaContract: HatsExcubia__factory
    let hatsExcubia: HatsExcubia

    let signer: Signer
    let signerAddress: string

    let gate: Signer
    let gateAddress: string

    let notWearerSigner: Signer
    let notWearerSignerAddress: string

    let mockHats: MockHats
    let mockHatsAddress: string

    const criterionHatsIds = [1]
    const invalidCriterionHatsIds = [2, 3]

    const encodedValidCriterionHat = AbiCoder.defaultAbiCoder().encode(["uint256"], [criterionHatsIds[0]])
    const encodedInvalidCriterionHat = AbiCoder.defaultAbiCoder().encode(["uint256"], [invalidCriterionHatsIds[0]])

    before(async function () {
        ;[signer, gate, notWearerSigner] = await ethers.getSigners()
        signerAddress = await signer.getAddress()
        gateAddress = await gate.getAddress()
        notWearerSignerAddress = await notWearerSigner.getAddress()

        MockHatsContract = await ethers.getContractFactory("MockHats")
        mockHats = await MockHatsContract.deploy(criterionHatsIds, [signerAddress])
        mockHatsAddress = await mockHats.getAddress()

        HatsExcubiaContract = await ethers.getContractFactory("HatsExcubia")
        hatsExcubia = await HatsExcubiaContract.deploy(mockHatsAddress, criterionHatsIds)
    })

    describe("constructor()", function () {
        it("Should deploy the HatsExcubia contract correctly", async function () {
            expect(hatsExcubia).to.not.eq(undefined)
        })

        it("Should deploy the MockHats contract correctly", async function () {
            expect(mockHats).to.not.eq(undefined)
        })

        it("Should fail to deploy HatsExcubia when hats parameter is not valid", async () => {
            await expect(HatsExcubiaContract.deploy(ZeroAddress, criterionHatsIds)).to.be.revertedWithCustomError(
                hatsExcubia,
                "ZeroAddress"
            )
        })

        it("Should fail to deploy HatsExcubia when hats parameter is not valid", async () => {
            await expect(HatsExcubiaContract.deploy(mockHatsAddress, [])).to.be.revertedWithCustomError(
                hatsExcubia,
                "ZeroCriterionHats"
            )
        })
    })

    describe("trait()", function () {
        it("should return the trait of the Excubia contract", async () => {
            expect(await hatsExcubia.trait()).to.be.equal("Hats")
        })
    })

    describe("setGate()", function () {
        it("should fail to set the gate when the caller is not the owner", async () => {
            const [, notOwnerSigner] = await ethers.getSigners()

            await expect(hatsExcubia.connect(notOwnerSigner).setGate(gateAddress)).to.be.revertedWithCustomError(
                hatsExcubia,
                "OwnableUnauthorizedAccount"
            )
        })

        it("should fail to set the gate when the gate address is zero", async () => {
            await expect(hatsExcubia.setGate(ZeroAddress)).to.be.revertedWithCustomError(hatsExcubia, "ZeroAddress")
        })

        it("Should set the gate contract address correctly", async function () {
            const tx = await hatsExcubia.setGate(gateAddress)
            const receipt = await tx.wait()
            const event = HatsExcubiaContract.interface.parseLog(
                receipt?.logs[0] as unknown as { topics: string[]; data: string }
            ) as unknown as {
                args: {
                    gate: string
                }
            }

            expect(receipt?.status).to.eq(1)
            expect(event.args.gate).to.eq(gateAddress)
            expect(await hatsExcubia.gate()).to.eq(gateAddress)
        })

        it("Should fail to set the gate if already set", async function () {
            await expect(hatsExcubia.setGate(gateAddress)).to.be.revertedWithCustomError(hatsExcubia, "GateAlreadySet")
        })
    })

    describe("check()", function () {
        it("should throw when the hat is not a criterion one", async () => {
            await expect(hatsExcubia.check(signerAddress, encodedInvalidCriterionHat)).to.be.revertedWithCustomError(
                hatsExcubia,
                "NotCriterionHat"
            )

            expect(await hatsExcubia.criterionHat(invalidCriterionHatsIds[0])).to.be.false
        })

        it("should throw when the user is not wearing the criterion hat", async () => {
            await expect(
                hatsExcubia.check(notWearerSignerAddress, encodedValidCriterionHat)
            ).to.be.revertedWithCustomError(hatsExcubia, "NotWearingCriterionHat")
        })

        it("should check", async () => {
            await expect(hatsExcubia.check(signerAddress, encodedValidCriterionHat)).to.not.be.reverted

            // check does NOT change the state of the contract (see pass()).
            expect(await hatsExcubia.passedUsers(signerAddress)).to.be.false
        })
    })

    describe("pass()", function () {
        it("should throw when the callee is not the gate", async () => {
            await expect(
                hatsExcubia.connect(signer).pass(signerAddress, encodedValidCriterionHat)
            ).to.be.revertedWithCustomError(hatsExcubia, "GateOnly")
        })

        it("should throw when the hat is not a criterion one", async () => {
            await expect(
                hatsExcubia.connect(gate).pass(signerAddress, encodedInvalidCriterionHat)
            ).to.be.revertedWithCustomError(hatsExcubia, "NotCriterionHat")

            expect(await hatsExcubia.criterionHat(invalidCriterionHatsIds[0])).to.be.false
        })

        it("should throw when the user is not wearing the criterion hat", async () => {
            await expect(
                hatsExcubia.connect(gate).pass(notWearerSignerAddress, encodedValidCriterionHat)
            ).to.be.revertedWithCustomError(hatsExcubia, "NotWearingCriterionHat")
        })

        it("should pass", async () => {
            const tx = await hatsExcubia.connect(gate).pass(signerAddress, encodedValidCriterionHat)
            const receipt = await tx.wait()
            const event = HatsExcubiaContract.interface.parseLog(
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
            expect(await hatsExcubia.passedUsers(signerAddress)).to.be.true
        })

        it("should prevent to pass twice", async () => {
            await expect(
                hatsExcubia.connect(gate).pass(signerAddress, encodedValidCriterionHat)
            ).to.be.revertedWithCustomError(hatsExcubia, "AlreadyPassed")
        })
    })
})
