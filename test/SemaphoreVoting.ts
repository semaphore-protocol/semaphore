import { expect } from "chai"
import { ethers, run } from "hardhat"
import { SemaphoreVoting } from "../build/typechain"
import { BigNumber, Signer, utils } from "ethers"
import { config } from "../package.json"

import { Identity } from "../packages/identity/src"
import { Group } from "@semaphore-protocol/group"
import {
    generateNullifierHash,
    generateProof,
    packToSolidityProof,
    PublicSignals,
    SolidityProof
} from "../packages/proof/src"
import { toFixedHex, createRootsBytes, createIdentities } from "./utils"

describe("SemaphoreVoting", () => {
    let contract: SemaphoreVoting
    let accounts: Signer[]
    let coordinator: string

    const zero = BigInt("21663839004416932945382355908790599225266501822907911457504978515578255421292")
    const chainID = BigInt(1099511629113);
    const treeDepth = Number(process.env.TREE_DEPTH)
    const pollIds = [BigInt(1), BigInt(2), BigInt(3)]
    const encryptionKey = BigInt(0)
    const decryptionKey = BigInt(0)
    const maxEdges = 1;

    // const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
    // const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`
    const wasmFilePath = `./fixtures/20/2/semaphore_20_2.wasm`
    const zkeyFilePath = `./fixtures/20/2/circuit_final.zkey`

    type VerifierContractInfo = { 
        name: string;
        address: string;
        depth: string;
        maxEdges: string
    }

    before(async () => {
        const { address: v2_address } = await run("deploy:verifier", { logs: false, depth: treeDepth, maxEdges: 2 })
        const VerifierV2: VerifierContractInfo = {
            name: `Verifier${treeDepth}_${2}`,
            address: v2_address,
            depth: `${treeDepth}`,
            maxEdges: `2`
        }

        const { address: v7_address } = await run("deploy:verifier", { logs: false, depth: treeDepth, maxEdges: 7 })
        const VerifierV7: VerifierContractInfo = {
            name: `Verifier${treeDepth}_${7}`,
            address: v7_address,
            depth: `${treeDepth}`,
            maxEdges: `7`
        }

        const deployedVerifiers: Map<string, VerifierContractInfo> = new Map([["v2", VerifierV2], ["v7", VerifierV7]]);

        const verifierSelector = await run("deploy:verifier-selector", {
            logs: false,
            verifiers: deployedVerifiers
        })
        contract = await run("deploy:semaphore-voting", { logs: true, verifier: verifierSelector.address })
        accounts = await ethers.getSigners()
        coordinator = await accounts[1].getAddress()
    })

    describe("# createPoll", () => {
        it("Should not create a poll with a wrong depth", async () => {
            const transaction = contract.createPoll(pollIds[0], 10, zero, coordinator, maxEdges)

            await expect(transaction).to.be.revertedWith("SemaphoreVoting: depth value is not supported")
        })

        it("Should not create a poll greater than the snark scalar field", async () => {
            const transaction = contract.createPoll(
                BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495618"),
                treeDepth,
                zero,
                coordinator,
                maxEdges
            )

            await expect(transaction).to.be.revertedWith("Semaphore__GroupIdIsNotLessThanSnarkScalarField()")
        })

        it("Should create a poll", async () => {
            const transaction = contract.createPoll(pollIds[0], treeDepth, zero, coordinator, maxEdges)

            await expect(transaction).to.emit(contract, "PollCreated").withArgs(pollIds[0], coordinator)
        })

        it("Should not create a poll if it already exists", async () => {
            const transaction = contract.createPoll(pollIds[0], treeDepth, zero, coordinator, maxEdges)

            await expect(transaction).to.be.revertedWith("Semaphore__GroupAlreadyExists()")
        })
    })

    describe("# startPoll", () => {
        it("Should not start the poll if the caller is not the coordinator", async () => {
            const transaction = contract.startPoll(pollIds[0], encryptionKey)

            await expect(transaction).to.be.revertedWith("SemaphoreVoting: caller is not the poll coordinator")
        })

        it("Should start the poll", async () => {
            const transaction = contract.connect(accounts[1]).startPoll(pollIds[0], encryptionKey)

            await expect(transaction).to.emit(contract, "PollStarted").withArgs(pollIds[0], coordinator, encryptionKey)
        })

        it("Should not start a poll if it has already been started", async () => {
            const transaction = contract.connect(accounts[1]).startPoll(pollIds[0], encryptionKey)

            await expect(transaction).to.be.revertedWith("SemaphoreVoting: poll has already been started")
        })
    })

    describe("# addVoter", () => {
        before(async () => {
            await contract.createPoll(pollIds[1], treeDepth, zero, coordinator, maxEdges)
        })

        it("Should not add a voter if the caller is not the coordinator", async () => {
            const identity = new Identity(chainID)
            const identityCommitment = identity.generateCommitment()

            const transaction = contract.addVoter(pollIds[0], identityCommitment)

            await expect(transaction).to.be.revertedWith("SemaphoreVoting: caller is not the poll coordinator")
        })

        it("Should not add a voter if the poll has already been started", async () => {
            const identity = new Identity(chainID)
            const identityCommitment = identity.generateCommitment()

            const transaction = contract.connect(accounts[1]).addVoter(pollIds[0], identityCommitment)

            await expect(transaction).to.be.revertedWith("SemaphoreVoting: voters can only be added before voting")
        })

        it("Should add a voter to an existing poll", async () => {
            const identity = new Identity(chainID, "test")
            const identityCommitment = identity.generateCommitment()

            const transaction = contract.connect(accounts[1]).addVoter(pollIds[1], identityCommitment)

            await expect(transaction)
                .to.emit(contract, "MemberAdded")
                .withArgs(
                    pollIds[1],
                    identityCommitment,
                    // "14787813191318312920980352979830075893203307366494541177071234930769373297362"
                    "7943806797233700547041913393384710769504872928213070894800658208056456315893"
                )
        })

        it("Should return the correct number of poll voters", async () => {
            const size = await contract.getNumberOfLeaves(pollIds[1])

            expect(size).to.be.eq(1)
        })
    })

    describe("# castVote", () => {
        const identity = new Identity(chainID, "test")
        const identityCommitment = identity.generateCommitment()
        const vote = "1"
        const bytes32Vote = utils.formatBytes32String(vote)

        const group = new Group(treeDepth, zero)

        group.addMembers([identityCommitment, BigInt(1)])

        let solidityProof: SolidityProof
        let publicSignals: PublicSignals

        before(async () => {
            await contract.connect(accounts[1]).addVoter(pollIds[1], BigInt(1))
            await contract.connect(accounts[1]).startPoll(pollIds[1], encryptionKey)
            await contract.createPoll(pollIds[2], treeDepth, zero, coordinator, maxEdges)

            const fullProof = await generateProof(identity, group, pollIds[1], vote, {
                wasmFilePath,
                zkeyFilePath
            })

            publicSignals = fullProof.publicSignals
            solidityProof = packToSolidityProof(fullProof.proof)
        })

        it("Should not cast a vote if the caller is not the coordinator", async () => {
            const root = await contract.getRoot(pollIds[0]);
            const roots = [root.toHexString(), toFixedHex(BigNumber.from(0).toHexString(), 32)] 
            const transaction = contract.castVote(bytes32Vote, publicSignals.nullifierHash, pollIds[0], createRootsBytes(roots), solidityProof, maxEdges, root)

            await expect(transaction).to.be.revertedWith("SemaphoreVoting: caller is not the poll coordinator")
        })

        it("Should not cast a vote if the poll is not ongoing", async () => {
            const root = await contract.getRoot(pollIds[2]);
            const roots = [root.toHexString(), toFixedHex(BigNumber.from(0).toHexString(), 32)] 
            const transaction = contract
                .connect(accounts[1])
                .castVote(bytes32Vote, publicSignals.nullifierHash, pollIds[2], createRootsBytes(roots), solidityProof, maxEdges, root)

            await expect(transaction).to.be.revertedWith("SemaphoreVoting: vote can only be cast in an ongoing poll")
        })

        it("Should not cast a vote if the proof is not valid", async () => {
            const root = await contract.getRoot(pollIds[0]);
            const roots = [root.toHexString(), toFixedHex(BigNumber.from(0).toHexString(), 32)] 
            const nullifierHash = generateNullifierHash(pollIds[0], identity.getNullifier(), chainID)

            const transaction = contract
                .connect(accounts[1])
                .castVote(bytes32Vote, nullifierHash, pollIds[1], createRootsBytes(roots), solidityProof, maxEdges, root)

            await expect(transaction).to.be.revertedWith("InvalidProof()")
        })

        it("Should cast a vote", async () => {
            const root = await contract.getRoot(pollIds[1]);
            const roots = [root.toHexString(), toFixedHex(BigNumber.from(0).toHexString(), 32)] 
            const transaction = contract
                .connect(accounts[1])
                .castVote(bytes32Vote, publicSignals.nullifierHash, pollIds[1], createRootsBytes(roots), solidityProof, maxEdges, root)

            await expect(transaction).to.emit(contract, "VoteAdded").withArgs(pollIds[1], bytes32Vote)
        })

        it("Should not cast a vote twice", async () => {
            const root = await contract.getRoot(pollIds[0]);
            const roots = [root.toHexString(), toFixedHex(BigNumber.from(0).toHexString(), 32)] 

            const transaction = contract
                .connect(accounts[1])
                .castVote(bytes32Vote, publicSignals.nullifierHash, pollIds[1], createRootsBytes(roots), solidityProof, maxEdges, root)

            await expect(transaction).to.be.revertedWith("Semaphore__YouAreUsingTheSameNillifierTwice()")
        })
    })

    describe("# endPoll", () => {
        it("Should not end the poll if the caller is not the coordinator", async () => {
            const transaction = contract.endPoll(pollIds[1], decryptionKey)

            await expect(transaction).to.be.revertedWith("SemaphoreVoting: caller is not the poll coordinator")
        })

        it("Should end the poll", async () => {
            const transaction = contract.connect(accounts[1]).endPoll(pollIds[1], encryptionKey)

            await expect(transaction).to.emit(contract, "PollEnded").withArgs(pollIds[1], coordinator, decryptionKey)
        })

        it("Should not end a poll if it has already been ended", async () => {
            const transaction = contract.connect(accounts[1]).endPoll(pollIds[1], encryptionKey)

            await expect(transaction).to.be.revertedWith("SemaphoreVoting: poll is not ongoing")
        })
    })
})
