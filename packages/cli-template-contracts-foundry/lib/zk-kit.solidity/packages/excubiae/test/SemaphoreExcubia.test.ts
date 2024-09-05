import { expect } from "chai"
import { ethers } from "hardhat"
import { AbiCoder, Signer, ZeroAddress, toBeHex, zeroPadBytes } from "ethers"
import { SemaphoreExcubia, SemaphoreExcubia__factory, MockSemaphore, MockSemaphore__factory } from "../typechain-types"

describe("SemaphoreExcubia", function () {
    let MockSemaphoreContract: MockSemaphore__factory
    let SemaphoreExcubiaContract: SemaphoreExcubia__factory
    let semaphoreExcubia: SemaphoreExcubia

    let signer: Signer
    let signerAddress: string

    let gate: Signer
    let gateAddress: string

    let mockSemaphore: MockSemaphore
    let mockSemaphoreAddress: string

    const validGroupId = 0n
    const invalidGroupId = 1n

    const validProof = {
        merkleTreeDepth: 1n,
        merkleTreeRoot: 0n,
        nullifier: 0n,
        message: 0n,
        scope: validGroupId,
        points: [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n]
    }
    const invalidProof = {
        merkleTreeDepth: 1n,
        merkleTreeRoot: 0n,
        nullifier: 1n,
        message: 0n,
        scope: invalidGroupId,
        points: [1n, 0n, 0n, 0n, 0n, 0n, 0n, 0n]
    }

    const encodedValidProof = AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256", "uint256", "uint256", "uint256", "uint256[8]"],
        [
            validProof.merkleTreeDepth,
            validProof.merkleTreeRoot,
            validProof.nullifier,
            validProof.message,
            validProof.scope,
            validProof.points
        ]
    )

    const encodedInvalidScopeProof = AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256", "uint256", "uint256", "uint256", "uint256[8]"],
        [
            validProof.merkleTreeDepth,
            validProof.merkleTreeRoot,
            validProof.nullifier,
            validProof.message,
            invalidProof.scope,
            validProof.points
        ]
    )

    const encodedInvalidProof = AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256", "uint256", "uint256", "uint256", "uint256[8]"],
        [
            invalidProof.merkleTreeDepth,
            invalidProof.merkleTreeRoot,
            invalidProof.nullifier,
            invalidProof.message,
            validProof.scope,
            invalidProof.points
        ]
    )

    before(async function () {
        ;[signer, gate] = await ethers.getSigners()
        signerAddress = await signer.getAddress()
        gateAddress = await gate.getAddress()

        MockSemaphoreContract = await ethers.getContractFactory("MockSemaphore")
        mockSemaphore = await MockSemaphoreContract.deploy(
            [validGroupId],
            [validProof.nullifier, invalidProof.nullifier],
            [true, false]
        )
        mockSemaphoreAddress = await mockSemaphore.getAddress()

        SemaphoreExcubiaContract = await ethers.getContractFactory("SemaphoreExcubia")
        semaphoreExcubia = await SemaphoreExcubiaContract.deploy(mockSemaphore, validGroupId)
    })

    describe("constructor()", function () {
        it("Should deploy the SemaphoreExcubia contract correctly", async function () {
            expect(semaphoreExcubia).to.not.eq(undefined)
        })

        it("Should deploy the MockSemaphore contract correctly", async function () {
            expect(mockSemaphore).to.not.eq(undefined)
        })

        it("Should fail to deploy SemaphoreExcubia when semaphore parameter is not valid", async () => {
            await expect(SemaphoreExcubiaContract.deploy(ZeroAddress, validGroupId)).to.be.revertedWithCustomError(
                semaphoreExcubia,
                "ZeroAddress"
            )
        })

        it("Should fail to deploy SemaphoreExcubia when groupId parameter is not valid", async () => {
            await expect(
                SemaphoreExcubiaContract.deploy(mockSemaphoreAddress, invalidGroupId)
            ).to.be.revertedWithCustomError(semaphoreExcubia, "InvalidGroup")
        })
    })

    describe("trait()", function () {
        it("should return the trait of the Excubia contract", async () => {
            expect(await semaphoreExcubia.trait()).to.be.equal("Semaphore")
        })
    })

    describe("setGate()", function () {
        it("should fail to set the gate when the caller is not the owner", async () => {
            const [, notOwnerSigner] = await ethers.getSigners()

            await expect(semaphoreExcubia.connect(notOwnerSigner).setGate(gateAddress)).to.be.revertedWithCustomError(
                semaphoreExcubia,
                "OwnableUnauthorizedAccount"
            )
        })

        it("should fail to set the gate when the gate address is zero", async () => {
            await expect(semaphoreExcubia.setGate(ZeroAddress)).to.be.revertedWithCustomError(
                semaphoreExcubia,
                "ZeroAddress"
            )
        })

        it("Should set the gate contract address correctly", async function () {
            const tx = await semaphoreExcubia.setGate(gateAddress)
            const receipt = await tx.wait()
            const event = SemaphoreExcubiaContract.interface.parseLog(
                receipt?.logs[0] as unknown as { topics: string[]; data: string }
            ) as unknown as {
                args: {
                    gate: string
                }
            }

            expect(receipt?.status).to.eq(1)
            expect(event.args.gate).to.eq(gateAddress)
            expect(await semaphoreExcubia.gate()).to.eq(gateAddress)
        })

        it("Should fail to set the gate if already set", async function () {
            await expect(semaphoreExcubia.setGate(gateAddress)).to.be.revertedWithCustomError(
                semaphoreExcubia,
                "GateAlreadySet"
            )
        })
    })

    describe("check()", function () {
        it("should throw when the scope is not the one expected", async () => {
            await expect(semaphoreExcubia.check(signerAddress, encodedInvalidScopeProof)).to.be.revertedWithCustomError(
                semaphoreExcubia,
                "UnexpectedScope"
            )
        })

        it("should throw when the proof is invalid", async () => {
            await expect(semaphoreExcubia.check(signerAddress, encodedInvalidProof)).to.be.revertedWithCustomError(
                semaphoreExcubia,
                "InvalidProof"
            )
        })

        it("should check", async () => {
            await expect(semaphoreExcubia.check(signerAddress, encodedValidProof)).to.not.be.reverted

            // check does NOT change the state of the contract (see pass()).
            expect(await semaphoreExcubia.passedNullifiers(validProof.nullifier)).to.be.false
        })
    })

    describe("pass()", function () {
        it("should throw when the callee is not the gate", async () => {
            await expect(
                semaphoreExcubia.connect(signer).pass(signerAddress, encodedValidProof)
            ).to.be.revertedWithCustomError(semaphoreExcubia, "GateOnly")
        })

        it("should throw when the scope is not the one expected", async () => {
            await expect(
                semaphoreExcubia.connect(gate).pass(signerAddress, encodedInvalidScopeProof)
            ).to.be.revertedWithCustomError(semaphoreExcubia, "UnexpectedScope")
        })

        it("should throw when the proof is invalid", async () => {
            await expect(
                semaphoreExcubia.connect(gate).pass(signerAddress, encodedInvalidProof)
            ).to.be.revertedWithCustomError(semaphoreExcubia, "InvalidProof")
        })
        it("should pass", async () => {
            const tx = await semaphoreExcubia.connect(gate).pass(signerAddress, encodedValidProof)
            const receipt = await tx.wait()
            const event = SemaphoreExcubiaContract.interface.parseLog(
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
            expect(await semaphoreExcubia.passedNullifiers(validProof.nullifier)).to.be.true
        })

        it("should prevent to pass twice", async () => {
            await expect(
                semaphoreExcubia.connect(gate).pass(signerAddress, encodedValidProof)
            ).to.be.revertedWithCustomError(semaphoreExcubia, "AlreadyPassed")
        })
    })
})
