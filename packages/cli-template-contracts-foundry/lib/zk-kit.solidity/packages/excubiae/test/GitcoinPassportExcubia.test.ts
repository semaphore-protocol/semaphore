import { expect } from "chai"
import { ethers } from "hardhat"
import { AbiCoder, Signer, ZeroAddress, toBeHex, zeroPadBytes } from "ethers"
import {
    GitcoinPassportExcubia,
    GitcoinPassportExcubia__factory,
    MockGitcoinPassportDecoder,
    MockGitcoinPassportDecoder__factory
} from "../typechain-types"

describe("GitcoinPassportExcubia", function () {
    let MockGitcoinPassportDecoderContract: MockGitcoinPassportDecoder__factory
    let GitcoinPassportExcubiaContract: GitcoinPassportExcubia__factory
    let gitcoinPassportExcubia: GitcoinPassportExcubia

    let signer: Signer
    let signerAddress: string

    let gate: Signer
    let gateAddress: string

    let notEnoughScoreSigner: Signer
    let notEnoughScoreSignerAddress: string

    let mockGitcoinPassportDecoder: MockGitcoinPassportDecoder
    let mockGitcoinPassportDecoderAddress: string

    const thresholdScore = 35

    // Score is 4 digit with 2 decimals (5000 is 50.00).
    const validUserScore = 5000
    const invalidUserScore = 1000

    // This Excubia do not need any external encoded data for check & pass logic.
    const encodedDummyData = AbiCoder.defaultAbiCoder().encode(["uint256"], [0])

    before(async function () {
        ;[signer, gate, notEnoughScoreSigner] = await ethers.getSigners()
        signerAddress = await signer.getAddress()
        gateAddress = await gate.getAddress()
        notEnoughScoreSignerAddress = await notEnoughScoreSigner.getAddress()

        MockGitcoinPassportDecoderContract = await ethers.getContractFactory("MockGitcoinPassportDecoder")
        mockGitcoinPassportDecoder = await MockGitcoinPassportDecoderContract.deploy(
            [signerAddress, notEnoughScoreSignerAddress],
            [validUserScore, invalidUserScore]
        )
        mockGitcoinPassportDecoderAddress = await mockGitcoinPassportDecoder.getAddress()

        GitcoinPassportExcubiaContract = await ethers.getContractFactory("GitcoinPassportExcubia")
        gitcoinPassportExcubia = await GitcoinPassportExcubiaContract.deploy(
            mockGitcoinPassportDecoderAddress,
            thresholdScore
        )
    })

    describe("constructor()", function () {
        it("Should deploy the GitcoinPassportExcubia contract correctly", async function () {
            expect(gitcoinPassportExcubia).to.not.eq(undefined)
        })

        it("Should deploy the MockGitcoinPassportDecoder contract correctly", async function () {
            expect(mockGitcoinPassportDecoder).to.not.eq(undefined)
        })

        it("Should fail to deploy GitcoinPassportExcubia when decoder parameter is not valid", async () => {
            await expect(
                GitcoinPassportExcubiaContract.deploy(ZeroAddress, thresholdScore)
            ).to.be.revertedWithCustomError(gitcoinPassportExcubia, "ZeroAddress")
        })

        it("Should fail to deploy GitcoinPassportExcubia when thresholdScore parameter is not valid", async () => {
            await expect(
                GitcoinPassportExcubiaContract.deploy(mockGitcoinPassportDecoderAddress, 0)
            ).to.be.revertedWithCustomError(gitcoinPassportExcubia, "NegativeOrZeroThresholdScore")
        })
    })

    describe("trait()", function () {
        it("should return the trait of the Excubia contract", async () => {
            expect(await gitcoinPassportExcubia.trait()).to.be.equal("GitcoinPassport")
        })
    })

    describe("setGate()", function () {
        it("should fail to set the gate when the caller is not the owner", async () => {
            const [, notOwnerSigner] = await ethers.getSigners()

            await expect(
                gitcoinPassportExcubia.connect(notOwnerSigner).setGate(gateAddress)
            ).to.be.revertedWithCustomError(gitcoinPassportExcubia, "OwnableUnauthorizedAccount")
        })

        it("should fail to set the gate when the gate address is zero", async () => {
            await expect(gitcoinPassportExcubia.setGate(ZeroAddress)).to.be.revertedWithCustomError(
                gitcoinPassportExcubia,
                "ZeroAddress"
            )
        })

        it("Should set the gate contract address correctly", async function () {
            const tx = await gitcoinPassportExcubia.setGate(gateAddress)
            const receipt = await tx.wait()
            const event = GitcoinPassportExcubiaContract.interface.parseLog(
                receipt?.logs[0] as unknown as { topics: string[]; data: string }
            ) as unknown as {
                args: {
                    gate: string
                }
            }

            expect(receipt?.status).to.eq(1)
            expect(event.args.gate).to.eq(gateAddress)
            expect(await gitcoinPassportExcubia.gate()).to.eq(gateAddress)
        })

        it("Should fail to set the gate if already set", async function () {
            await expect(gitcoinPassportExcubia.setGate(gateAddress)).to.be.revertedWithCustomError(
                gitcoinPassportExcubia,
                "GateAlreadySet"
            )
        })
    })

    describe("check()", function () {
        it("should throw when the score is not enough", async () => {
            await expect(
                gitcoinPassportExcubia.check(notEnoughScoreSignerAddress, encodedDummyData)
            ).to.be.revertedWithCustomError(gitcoinPassportExcubia, "InsufficientScore")
        })

        it("should check", async () => {
            await gitcoinPassportExcubia.check(signerAddress, encodedDummyData)
            await expect(gitcoinPassportExcubia.check(signerAddress, encodedDummyData)).to.not.be.reverted

            // check does NOT change the state of the contract (see pass()).
            expect(await gitcoinPassportExcubia.passedUsers(signerAddress)).to.be.false
        })
    })

    describe("pass()", function () {
        it("should throw when the callee is not the gate", async () => {
            await expect(
                gitcoinPassportExcubia.connect(signer).pass(signerAddress, encodedDummyData)
            ).to.be.revertedWithCustomError(gitcoinPassportExcubia, "GateOnly")
        })

        it("should throw when the score is not enough", async () => {
            await expect(
                gitcoinPassportExcubia.connect(gate).pass(notEnoughScoreSignerAddress, encodedDummyData)
            ).to.be.revertedWithCustomError(gitcoinPassportExcubia, "InsufficientScore")
        })

        it("should pass", async () => {
            const tx = await gitcoinPassportExcubia.connect(gate).pass(signerAddress, encodedDummyData)
            const receipt = await tx.wait()
            const event = GitcoinPassportExcubiaContract.interface.parseLog(
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
            expect(await gitcoinPassportExcubia.passedUsers(signerAddress)).to.be.true
        })

        it("should prevent to pass twice", async () => {
            await expect(
                gitcoinPassportExcubia.connect(gate).pass(signerAddress, encodedDummyData)
            ).to.be.revertedWithCustomError(gitcoinPassportExcubia, "AlreadyPassed")
        })
    })
})
