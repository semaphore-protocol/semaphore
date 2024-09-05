import { expect } from "chai"
import { ethers } from "hardhat"
import { Signer, ZeroAddress } from "ethers"
import {
    ZKEdDSAEventTicketPCDExcubia,
    ZKEdDSAEventTicketPCDExcubia__factory,
    ZKEdDSAEventTicketPCDVerifier,
    ZKEdDSAEventTicketPCDVerifier__factory
} from "../typechain-types"

describe("ZKEdDSAEventTicketPCDExcubia", function () {
    let ZKEdDSAEventTicketPCDExcubiaContract: ZKEdDSAEventTicketPCDExcubia__factory
    let zkEdDSAEventTicketPCDExcubia: ZKEdDSAEventTicketPCDExcubia

    let ZKEdDSAEventTicketPCDVerifierContract: ZKEdDSAEventTicketPCDVerifier__factory
    let zkEdDSAEventTicketPCDVerifier: ZKEdDSAEventTicketPCDVerifier

    let signer: Signer
    let signerAddress: string

    let gate: Signer
    let gateAddress: string

    let zkEdDSAEventTicketPCDVerifierAddress: string

    let invalid0SignersExcubiaContract: ZKEdDSAEventTicketPCDExcubia
    let invalid1SignersExcubiaContract: ZKEdDSAEventTicketPCDExcubia
    let invalidTicketIdExcubiaContract: ZKEdDSAEventTicketPCDExcubia

    // ETHBerlin 4 event ticket encoded proof.
    // recipient: 0x627306090abaB3A6e1400e9345bC60c78a8BEf57 (default signer with TEST_MNEMONIC).
    const encodedValidProof =
        "0x26c0c2afcf93e0c18ddab29e1d046b550b6c142bcbb8bf7abf0a1b86389a46c21d7af6d964ca33399f01f8e0e5bf5b6f9771f07b6c8db0216dc41ef57db4fe5e09254849fadccfb1889e94946ff4845803e5d23f7cf3c2495af5551fa74171e225776c6bf746cdf27021d05f98e019c1ef20a2b0c1d7bd370893da152e91617b00a60e0d752953f863b253e0686cf1760307ddc542ebb7646b3abb84d56924402ec059de1e138b2869456633a6908d9f195ed75146d355275709a914c74c26ff07f4d30917007e9d95d0d52586d40392848588fe65c1386a6c75c846dd479f1c19b05ade4571f1cdd2a0017b281a767dc4533976891160a9e6b312a883b2aec6000000000000000000000000000000001ae3463162dc5ba99d9e01602c18d96f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000000010ef63ac10e10e307f558470b38753eef9190c3843254bbb60292905e4021801ebfb986fbac5113f8e2c72286fe9362f8e7d211dbc68227a468d7b919e7500310ec38f11baacad5535525bbe8e343074a483c051aa1616266f3b1df3fb7d2040000000000000000000000000000000053edb3e7673341e0a9be488877c5c57230644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000627306090abab3a6e1400e9345bc60c78a8bef57000000000000000000000000627306090abab3a6e1400e9345bc60c78a8bef57"
    // ETHBerlin 4 event UUID converted to bigint.
    const validEventId = "111560146890584288369567824893314450802"
    // ETHBerlin 4 event ticket signer converted to bigint.
    const validEventTicketPCDSigner = [
        "13908133709081944902758389525983124100292637002438232157513257158004852609027",
        "7654374482676219729919246464135900991450848628968334062174564799457623790084"
    ]
    const validTicketId = "35740002958743364890071866196201363823"

    const invalidEventId = "111560146890584288369567824893314400000"
    const invalidEventTicketPCDSigner = [
        "13908133709081944902758389525983124100292637002438232157513257158004852600000",
        "7654374482676219729919246464135900991450848628968334062174564799457623700000"
    ]
    const encodedInvalidWatermarkProof =
        "0x0c6c75cffbdaf232302db8a64825e8f3325538ee130b75e68b451d87c471642a231ff0c0556aaf4c951943bd093cee59805017bafa25aa8d90de1fff79ad02be1533eb18a35a54037afe3f98fb7a3e0ec7154c285f43c7aae307ef4910bacba312a7ab261e963b05a7ec3f82fca280a94d7103e2229c9fef004ac66aaa13ea7a26162d6f0f602c843ff9442d8b5af0d90090b93ac36eaa349db07509c0501e711cad5b79ca9bf07f3a57896a118ad82890833cb2491a6bf3b929ccb5e30be41809457222cccc6405701acafdac0f62687e7944e21fb5b8641fbf8e2a02a12bb12a3a8459d26c86fb10e18bc1972064f3f22a187762693b361012443e20fe22d0000000000000000000000000000000001ae3463162dc5ba99d9e01602c18d96f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000000f0bfa9b3b55358ffc5ebdef847df1c68327f76cd4e041d47248999cb142b33d1ebfb986fbac5113f8e2c72286fe9362f8e7d211dbc68227a468d7b919e7500310ec38f11baacad5535525bbe8e343074a483c051aa1616266f3b1df3fb7d2040000000000000000000000000000000053edb3e7673341e0a9be488877c5c57230644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266"
    const encodedInvalidProof =
        "0x36c0c2afcf93e0c18ddab29e1d046b550b6c142bcbb8bf7abf0a1b86389a46c21d7af6d964ca33399f01f8e0e5bf5b6f9771f07b6c8db0216dc41ef57db4fe5e09254849fadccfb1889e94946ff4845803e5d23f7cf3c2495af5551fa74171e225776c6bf746cdf27021d05f98e019c1ef20a2b0c1d7bd370893da152e91617b00a60e0d752953f863b253e0686cf1760307ddc542ebb7646b3abb84d56924402ec059de1e138b2869456633a6908d9f195ed75146d355275709a914c74c26ff07f4d30917007e9d95d0d52586d40392848588fe65c1386a6c75c846dd479f1c19b05ade4571f1cdd2a0017b281a767dc4533976891160a9e6b312a883b2aec6000000000000000000000000000000001ae3463162dc5ba99d9e01602c18d96f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000000010ef63ac10e10e307f558470b38753eef9190c3843254bbb60292905e4021801ebfb986fbac5113f8e2c72286fe9362f8e7d211dbc68227a468d7b919e7500310ec38f11baacad5535525bbe8e343074a483c051aa1616266f3b1df3fb7d2040000000000000000000000000000000053edb3e7673341e0a9be488877c5c57230644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000627306090abab3a6e1400e9345bc60c78a8bef57000000000000000000000000627306090abab3a6e1400e9345bc60c78a8bef57"

    before(async function () {
        ;[signer, gate] = await ethers.getSigners()
        signerAddress = await signer.getAddress()
        gateAddress = await gate.getAddress()

        ZKEdDSAEventTicketPCDVerifierContract = await ethers.getContractFactory("ZKEdDSAEventTicketPCDVerifier")
        zkEdDSAEventTicketPCDVerifier = await ZKEdDSAEventTicketPCDVerifierContract.deploy()
        zkEdDSAEventTicketPCDVerifierAddress = await zkEdDSAEventTicketPCDVerifier.getAddress()

        ZKEdDSAEventTicketPCDExcubiaContract = await ethers.getContractFactory("ZKEdDSAEventTicketPCDExcubia")
        zkEdDSAEventTicketPCDExcubia = await ZKEdDSAEventTicketPCDExcubiaContract.deploy(
            zkEdDSAEventTicketPCDVerifierAddress,
            validEventId,
            validEventTicketPCDSigner[0],
            validEventTicketPCDSigner[1]
        )

        invalid0SignersExcubiaContract = await ZKEdDSAEventTicketPCDExcubiaContract.deploy(
            zkEdDSAEventTicketPCDVerifierAddress,
            validEventId,
            invalidEventTicketPCDSigner[0],
            validEventTicketPCDSigner[1]
        )
        invalid0SignersExcubiaContract.setGate(gateAddress)

        invalid1SignersExcubiaContract = await ZKEdDSAEventTicketPCDExcubiaContract.deploy(
            zkEdDSAEventTicketPCDVerifierAddress,
            validEventId,
            validEventTicketPCDSigner[0],
            invalidEventTicketPCDSigner[1]
        )
        invalid1SignersExcubiaContract.setGate(gateAddress)

        invalidTicketIdExcubiaContract = await ZKEdDSAEventTicketPCDExcubiaContract.deploy(
            zkEdDSAEventTicketPCDVerifierAddress,
            invalidEventId,
            validEventTicketPCDSigner[0],
            validEventTicketPCDSigner[1]
        )
        invalidTicketIdExcubiaContract.setGate(gateAddress)
    })

    describe("constructor()", function () {
        it("Should deploy the zkEdDSAEventTicketPCDVerifier contract correctly", async function () {
            expect(zkEdDSAEventTicketPCDVerifier).to.not.eq(undefined)
        })

        it("Should deploy the ZKEdDSAEventTicketPCDExcubia contract correctly", async function () {
            expect(zkEdDSAEventTicketPCDExcubia).to.not.eq(undefined)
        })

        it("Should fail to deploy ZKEdDSAEventTicketPCDExcubia when verifier parameter is not valid", async () => {
            const verifierIsZeroAddressContract = ZKEdDSAEventTicketPCDExcubiaContract.deploy(
                ZeroAddress,
                validEventId,
                validEventTicketPCDSigner[0],
                validEventTicketPCDSigner[1]
            )

            await expect(verifierIsZeroAddressContract).to.be.revertedWithCustomError(
                zkEdDSAEventTicketPCDExcubia,
                "ZeroAddress"
            )
        })
    })

    describe("trait()", function () {
        it("should return the trait of the Excubia contract", async () => {
            expect(await zkEdDSAEventTicketPCDExcubia.trait()).to.be.equal("ZKEdDSAEventTicketPCD")
        })
    })

    describe("setGate()", function () {
        it("should fail to set the gate when the caller is not the owner", async () => {
            const [, notOwnerSigner] = await ethers.getSigners()

            await expect(
                zkEdDSAEventTicketPCDExcubia.connect(notOwnerSigner).setGate(gateAddress)
            ).to.be.revertedWithCustomError(zkEdDSAEventTicketPCDExcubia, "OwnableUnauthorizedAccount")
        })

        it("should fail to set the gate when the gate address is zero", async () => {
            await expect(zkEdDSAEventTicketPCDExcubia.setGate(ZeroAddress)).to.be.revertedWithCustomError(
                zkEdDSAEventTicketPCDExcubia,
                "ZeroAddress"
            )
        })

        it("Should set the gate contract address correctly", async function () {
            const tx = await zkEdDSAEventTicketPCDExcubia.setGate(gateAddress)
            const receipt = await tx.wait()
            const event = zkEdDSAEventTicketPCDExcubia.interface.parseLog(
                receipt?.logs[0] as unknown as { topics: string[]; data: string }
            ) as unknown as {
                args: {
                    gate: string
                }
            }

            expect(receipt?.status).to.eq(1)
            expect(event.args.gate).to.eq(gateAddress)
            expect(await zkEdDSAEventTicketPCDExcubia.gate()).to.eq(gateAddress)
        })

        it("Should fail to set the gate if already set", async function () {
            await expect(zkEdDSAEventTicketPCDExcubia.setGate(gateAddress)).to.be.revertedWithCustomError(
                zkEdDSAEventTicketPCDExcubia,
                "GateAlreadySet"
            )
        })
    })

    describe("check()", function () {
        it("should throw when the signers are not the ones expected", async () => {
            await expect(
                invalid0SignersExcubiaContract.check(signerAddress, encodedValidProof)
            ).to.be.revertedWithCustomError(zkEdDSAEventTicketPCDExcubia, "InvalidSigners")

            await expect(
                invalid1SignersExcubiaContract.check(signerAddress, encodedValidProof)
            ).to.be.revertedWithCustomError(zkEdDSAEventTicketPCDExcubia, "InvalidSigners")
        })

        it("should throw when the event id is not the one expected", async () => {
            await expect(
                invalidTicketIdExcubiaContract.check(signerAddress, encodedValidProof)
            ).to.be.revertedWithCustomError(zkEdDSAEventTicketPCDExcubia, "InvalidEventId")
        })

        it("should throw when the watermark is not the one expected", async () => {
            await expect(
                zkEdDSAEventTicketPCDExcubia.check(signerAddress, encodedInvalidWatermarkProof)
            ).to.be.revertedWithCustomError(zkEdDSAEventTicketPCDExcubia, "InvalidWatermark")
        })

        it("should throw when the proof is invalid", async () => {
            await expect(
                zkEdDSAEventTicketPCDExcubia.check(signerAddress, encodedInvalidProof)
            ).to.be.revertedWithCustomError(zkEdDSAEventTicketPCDExcubia, "InvalidProof")
        })

        it("should check", async () => {
            await expect(zkEdDSAEventTicketPCDExcubia.check(signerAddress, encodedValidProof)).to.not.be.reverted

            // check does NOT change the state of the contract (see pass()).
            expect(await zkEdDSAEventTicketPCDExcubia.passedZKEdDSAEventTicketPCDs(validTicketId)).to.be.false
        })
    })

    describe("pass()", function () {
        it("should throw when the callee is not the gate", async () => {
            await expect(
                zkEdDSAEventTicketPCDExcubia.connect(signer).pass(signerAddress, encodedValidProof)
            ).to.be.revertedWithCustomError(zkEdDSAEventTicketPCDExcubia, "GateOnly")
        })

        it("should throw when the signers are not the ones expected", async () => {
            await expect(
                invalid0SignersExcubiaContract.connect(gate).pass(signerAddress, encodedValidProof)
            ).to.be.revertedWithCustomError(zkEdDSAEventTicketPCDExcubia, "InvalidSigners")

            await expect(
                invalid1SignersExcubiaContract.connect(gate).pass(signerAddress, encodedValidProof)
            ).to.be.revertedWithCustomError(zkEdDSAEventTicketPCDExcubia, "InvalidSigners")
        })

        it("should throw when the event id is not the one expected", async () => {
            await expect(
                invalidTicketIdExcubiaContract.connect(gate).pass(signerAddress, encodedValidProof)
            ).to.be.revertedWithCustomError(zkEdDSAEventTicketPCDExcubia, "InvalidEventId")
        })

        it("should throw when the watermark is not the one expected", async () => {
            await expect(
                zkEdDSAEventTicketPCDExcubia.connect(gate).pass(signerAddress, encodedInvalidWatermarkProof)
            ).to.be.revertedWithCustomError(zkEdDSAEventTicketPCDExcubia, "InvalidWatermark")
        })

        it("should throw when the proof is invalid", async () => {
            await expect(
                zkEdDSAEventTicketPCDExcubia.connect(gate).pass(signerAddress, encodedInvalidProof)
            ).to.be.revertedWithCustomError(zkEdDSAEventTicketPCDExcubia, "InvalidProof")
        })

        it("should pass", async () => {
            const tx = await zkEdDSAEventTicketPCDExcubia.connect(gate).pass(signerAddress, encodedValidProof)
            const receipt = await tx.wait()
            const event = zkEdDSAEventTicketPCDExcubia.interface.parseLog(
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
            expect(await zkEdDSAEventTicketPCDExcubia.passedZKEdDSAEventTicketPCDs(validTicketId)).to.be.true
        })

        it("should prevent to pass twice", async () => {
            await expect(
                zkEdDSAEventTicketPCDExcubia.connect(gate).pass(signerAddress, encodedValidProof)
            ).to.be.revertedWithCustomError(zkEdDSAEventTicketPCDExcubia, "AlreadyPassed")
        })
    })
})
