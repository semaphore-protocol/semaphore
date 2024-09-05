import { expect } from "chai"
import { ethers } from "hardhat"
import { AbiCoder, Signer, ZeroAddress } from "ethers"
import { ERC721Excubia, ERC721Excubia__factory, MockERC721, MockERC721__factory } from "../typechain-types"

describe("ERC721Excubia", function () {
    let MockERC721Contract: MockERC721__factory
    let ERC721ExcubiaContract: ERC721Excubia__factory
    let erc721Excubia: ERC721Excubia

    let signer: Signer
    let signerAddress: string

    let gate: Signer
    let gateAddress: string

    let anotherTokenOwner: Signer
    let anotherTokenOwnerAddress: string

    let mockERC721: MockERC721
    let mockERC721Address: string

    const rawValidTokenId = 0
    const rawInvalidOwnerTokenId = 1

    const encodedValidTokenId = AbiCoder.defaultAbiCoder().encode(["uint256"], [rawValidTokenId])
    const encodedInvalidOwnerTokenId = AbiCoder.defaultAbiCoder().encode(["uint256"], [rawInvalidOwnerTokenId])

    before(async function () {
        ;[signer, gate, anotherTokenOwner] = await ethers.getSigners()
        signerAddress = await signer.getAddress()
        gateAddress = await gate.getAddress()
        anotherTokenOwnerAddress = await anotherTokenOwner.getAddress()

        MockERC721Contract = await ethers.getContractFactory("MockERC721")
        mockERC721 = await MockERC721Contract.deploy()
        mockERC721Address = await mockERC721.getAddress()

        // assign to `signerAddress` token with id equal to `1`.
        await mockERC721.mintAndGiveToken(signerAddress)
        await mockERC721.mintAndGiveToken(anotherTokenOwnerAddress)

        ERC721ExcubiaContract = await ethers.getContractFactory("ERC721Excubia")
        erc721Excubia = await ERC721ExcubiaContract.deploy(mockERC721Address)
    })

    describe("constructor()", function () {
        it("Should deploy the ERC721Excubia contract correctly", async function () {
            expect(erc721Excubia).to.not.eq(undefined)
        })

        it("Should deploy the MockERC721 contract correctly", async function () {
            expect(mockERC721).to.not.eq(undefined)
        })

        it("Should fail to deploy ERC721Excubia when erc721 parameter is not valid", async () => {
            await expect(ERC721ExcubiaContract.deploy(ZeroAddress)).to.be.revertedWithCustomError(
                erc721Excubia,
                "ZeroAddress"
            )
        })
    })

    describe("trait()", function () {
        it("should return the trait of the Excubia contract", async () => {
            expect(await erc721Excubia.trait()).to.be.equal("ERC721")
        })
    })

    describe("setGate()", function () {
        it("should fail to set the gate when the caller is not the owner", async () => {
            const [, notOwnerSigner] = await ethers.getSigners()

            await expect(erc721Excubia.connect(notOwnerSigner).setGate(gateAddress)).to.be.revertedWithCustomError(
                erc721Excubia,
                "OwnableUnauthorizedAccount"
            )
        })

        it("should fail to set the gate when the gate address is zero", async () => {
            await expect(erc721Excubia.setGate(ZeroAddress)).to.be.revertedWithCustomError(erc721Excubia, "ZeroAddress")
        })

        it("Should set the gate contract address correctly", async function () {
            const tx = await erc721Excubia.setGate(gateAddress)
            const receipt = await tx.wait()
            const event = ERC721ExcubiaContract.interface.parseLog(
                receipt?.logs[0] as unknown as { topics: string[]; data: string }
            ) as unknown as {
                args: {
                    gate: string
                }
            }

            expect(receipt?.status).to.eq(1)
            expect(event.args.gate).to.eq(gateAddress)
            expect(await erc721Excubia.gate()).to.eq(gateAddress)
        })

        it("Should fail to set the gate if already set", async function () {
            await expect(erc721Excubia.setGate(gateAddress)).to.be.revertedWithCustomError(
                erc721Excubia,
                "GateAlreadySet"
            )
        })
    })

    describe("check()", function () {
        it("should throw when the token id is not owned by the correct recipient", async () => {
            expect(await mockERC721.ownerOf(encodedInvalidOwnerTokenId)).to.be.equal(anotherTokenOwnerAddress)

            await expect(erc721Excubia.check(signerAddress, encodedInvalidOwnerTokenId)).to.be.revertedWithCustomError(
                erc721Excubia,
                "UnexpectedTokenOwner"
            )
        })

        it("should check", async () => {
            await expect(erc721Excubia.check(signerAddress, encodedValidTokenId)).to.not.be.reverted

            // check does NOT change the state of the contract (see pass()).
            expect(await erc721Excubia.passedTokenIds(rawValidTokenId)).to.be.false
        })
    })

    describe("pass()", function () {
        it("should throw when the callee is not the gate", async () => {
            await expect(
                erc721Excubia.connect(signer).pass(signerAddress, encodedInvalidOwnerTokenId)
            ).to.be.revertedWithCustomError(erc721Excubia, "GateOnly")
        })

        it("should throw when the token id is not owned by the correct recipient", async () => {
            await expect(
                erc721Excubia.connect(gate).pass(signerAddress, encodedInvalidOwnerTokenId)
            ).to.be.revertedWithCustomError(erc721Excubia, "UnexpectedTokenOwner")
        })

        it("should pass", async () => {
            const tx = await erc721Excubia.connect(gate).pass(signerAddress, encodedValidTokenId)
            const receipt = await tx.wait()
            const event = ERC721ExcubiaContract.interface.parseLog(
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
            expect(await erc721Excubia.passedTokenIds(rawValidTokenId)).to.be.true
        })

        it("should prevent to pass twice", async () => {
            await expect(
                erc721Excubia.connect(gate).pass(signerAddress, encodedValidTokenId)
            ).to.be.revertedWithCustomError(erc721Excubia, "AlreadyPassed")
        })
    })
})
