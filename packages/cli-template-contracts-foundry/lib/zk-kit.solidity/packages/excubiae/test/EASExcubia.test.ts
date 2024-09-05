import { expect } from "chai"
import { ethers } from "hardhat"
import { AbiCoder, Signer, ZeroAddress, toBeHex, zeroPadBytes } from "ethers"
import { EASExcubia, EASExcubia__factory, MockEAS, MockEAS__factory } from "../typechain-types"

describe("EASExcubia", function () {
    let MockEASContract: MockEAS__factory
    let EASExcubiaContract: EASExcubia__factory
    let easExcubia: EASExcubia

    let signer: Signer
    let signerAddress: string

    let gate: Signer
    let gateAddress: string

    let mockEAS: MockEAS
    let mockEASAddress: string

    const schemaId = "0xfdcfdad2dbe7489e0ce56b260348b7f14e8365a8a325aef9834818c00d46b31b"
    const validAttestationId = AbiCoder.defaultAbiCoder().encode(["bytes32"], [zeroPadBytes(toBeHex(1), 32)])
    const revokedAttestationId = AbiCoder.defaultAbiCoder().encode(["bytes32"], [zeroPadBytes(toBeHex(2), 32)])
    const invalidSchemaAttestationId = AbiCoder.defaultAbiCoder().encode(["bytes32"], [zeroPadBytes(toBeHex(3), 32)])
    const invalidRecipientAttestationId = AbiCoder.defaultAbiCoder().encode(["bytes32"], [zeroPadBytes(toBeHex(4), 32)])
    const invalidAttesterAttestationId = AbiCoder.defaultAbiCoder().encode(["bytes32"], [zeroPadBytes(toBeHex(5), 32)])

    before(async function () {
        ;[signer, gate] = await ethers.getSigners()
        signerAddress = await signer.getAddress()
        gateAddress = await gate.getAddress()

        MockEASContract = await ethers.getContractFactory("MockEAS")
        mockEAS = await MockEASContract.deploy(signerAddress, signerAddress, schemaId)
        mockEASAddress = await mockEAS.getAddress()

        EASExcubiaContract = await ethers.getContractFactory("EASExcubia")
        easExcubia = await EASExcubiaContract.deploy(mockEASAddress, signerAddress, schemaId)
    })

    describe("constructor()", function () {
        it("Should deploy the EASExcubia contract correctly", async function () {
            expect(easExcubia).to.not.eq(undefined)
        })

        it("Should deploy the MockEAS contract correctly", async function () {
            expect(mockEAS).to.not.eq(undefined)
        })

        it("Should fail to deploy EASExcubia when eas parameter is not valid", async () => {
            await expect(EASExcubiaContract.deploy(ZeroAddress, ZeroAddress, schemaId)).to.be.revertedWithCustomError(
                easExcubia,
                "ZeroAddress"
            )
        })

        it("Should fail to deploy EASExcubia when attester parameter is not valid", async () => {
            await expect(
                EASExcubiaContract.deploy(await easExcubia.getAddress(), ZeroAddress, schemaId)
            ).to.be.revertedWithCustomError(easExcubia, "ZeroAddress")
        })
    })

    describe("trait()", function () {
        it("should return the trait of the Excubia contract", async () => {
            expect(await easExcubia.trait()).to.be.equal("EAS")
        })
    })

    describe("setGate()", function () {
        it("should fail to set the gate when the caller is not the owner", async () => {
            const [, notOwnerSigner] = await ethers.getSigners()

            await expect(easExcubia.connect(notOwnerSigner).setGate(gateAddress)).to.be.revertedWithCustomError(
                easExcubia,
                "OwnableUnauthorizedAccount"
            )
        })

        it("should fail to set the gate when the gate address is zero", async () => {
            await expect(easExcubia.setGate(ZeroAddress)).to.be.revertedWithCustomError(easExcubia, "ZeroAddress")
        })

        it("Should set the gate contract address correctly", async function () {
            const tx = await easExcubia.setGate(gateAddress)
            const receipt = await tx.wait()
            const event = EASExcubiaContract.interface.parseLog(
                receipt?.logs[0] as unknown as { topics: string[]; data: string }
            ) as unknown as {
                args: {
                    gate: string
                }
            }

            expect(receipt?.status).to.eq(1)
            expect(event.args.gate).to.eq(gateAddress)
            expect(await easExcubia.gate()).to.eq(gateAddress)
        })

        it("Should fail to set the gate if already set", async function () {
            await expect(easExcubia.setGate(gateAddress)).to.be.revertedWithCustomError(easExcubia, "GateAlreadySet")
        })
    })

    describe("check()", function () {
        it("should throw when the attestation is not owned by the correct recipient", async () => {
            await expect(easExcubia.check(signerAddress, invalidRecipientAttestationId)).to.be.revertedWithCustomError(
                easExcubia,
                "UnexpectedRecipient"
            )
        })

        it("should throw when the attestation has been revoked", async () => {
            await expect(easExcubia.check(signerAddress, revokedAttestationId)).to.be.revertedWithCustomError(
                easExcubia,
                "RevokedAttestation"
            )
        })

        it("should throw when the attestation schema is not the one expected", async () => {
            await expect(easExcubia.check(signerAddress, invalidSchemaAttestationId)).to.be.revertedWithCustomError(
                easExcubia,
                "UnexpectedSchema"
            )
        })

        it("should throw when the attestation is not signed by the attestation owner", async () => {
            await expect(easExcubia.check(signerAddress, invalidAttesterAttestationId)).to.be.revertedWithCustomError(
                easExcubia,
                "UnexpectedAttester"
            )
        })

        it("should check", async () => {
            await expect(easExcubia.check(signerAddress, validAttestationId)).to.not.be.reverted

            // check does NOT change the state of the contract (see pass()).
            expect(await easExcubia.passedAttestations(validAttestationId)).to.be.false
        })
    })

    describe("pass()", function () {
        it("should throw when the callee is not the gate", async () => {
            await expect(
                easExcubia.connect(signer).pass(signerAddress, invalidRecipientAttestationId)
            ).to.be.revertedWithCustomError(easExcubia, "GateOnly")
        })

        it("should throw when the attestation is not owned by the correct recipient", async () => {
            await expect(
                easExcubia.connect(gate).pass(signerAddress, invalidRecipientAttestationId)
            ).to.be.revertedWithCustomError(easExcubia, "UnexpectedRecipient")
        })

        it("should throw when the attestation has been revoked", async () => {
            await expect(
                easExcubia.connect(gate).pass(signerAddress, revokedAttestationId)
            ).to.be.revertedWithCustomError(easExcubia, "RevokedAttestation")
        })

        it("should throw when the attestation schema is not the one expected", async () => {
            await expect(
                easExcubia.connect(gate).pass(signerAddress, invalidSchemaAttestationId)
            ).to.be.revertedWithCustomError(easExcubia, "UnexpectedSchema")
        })

        it("should throw when the attestation is not signed by the attestation owner", async () => {
            await expect(
                easExcubia.connect(gate).pass(signerAddress, invalidAttesterAttestationId)
            ).to.be.revertedWithCustomError(easExcubia, "UnexpectedAttester")
        })

        it("should pass", async () => {
            const tx = await easExcubia.connect(gate).pass(signerAddress, validAttestationId)
            const receipt = await tx.wait()
            const event = EASExcubiaContract.interface.parseLog(
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
            expect(await easExcubia.passedAttestations(validAttestationId)).to.be.true
        })

        it("should prevent to pass twice", async () => {
            await expect(
                easExcubia.connect(gate).pass(signerAddress, validAttestationId)
            ).to.be.revertedWithCustomError(easExcubia, "AlreadyPassed")
        })
    })
})
