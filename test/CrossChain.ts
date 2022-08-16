import { expect } from "chai"
import { constants, Signer, utils, BigNumber, providers, Wallet } from "ethers"
import { ethers as hreEthers, run } from "hardhat"
import { Semaphore as SemaphoreContract } from "../build/typechain"
import { config } from "../package.json"
// import { SnarkArtifacts } from "@semaphore-protocol/proof"
import { Group } from "../packages/group/src"
import { FullProof, generateProof, packToSolidityProof, SolidityProof } from "../packages/proof/src/"
import { toFixedHex, VerifierContractInfo, createRootsBytes, createIdentities } from "./utils"
import { private_keys as ganacheAccounts } from "../accounts.json";
/** BigNumber to hex string of specified length */

describe("Semaphore", () => {
    let contractA: SemaphoreContract
    let contractB: SemaphoreContract
    let signersA: Signer[]
    let signersB: Signer[]
    let accounts: string[]
    let groupA: Group
    let groupB: Group

    const treeDepth = Number(process.env.TREE_DEPTH) | 20
    const circuitLength = Number(process.env.CIRCUIT_LENGTH) | 2
    const groupId = 1
    const maxEdges = 1
    const chainIDA = 1338
    const chainIDB = 1339
    let providerA = new providers.JsonRpcProvider("http://127.0.0.1:8545");
    let providerB = new providers.JsonRpcProvider("http://127.0.0.1:8546");
    const idsA = createIdentities(chainIDA, 5)
    const idsB = createIdentities(chainIDB, 5)
    const membersA = idsA.members
    const identitiesA = idsA.identities
    const membersB = idsB.members
    const identitiesB = idsB.identities
    // const zeroValue = BigInt("0x2fe54c60d3acabf3343a35b6eba15db4821b340f76e741e2249685ed4899af6c")
    const zeroValue = BigInt("21663839004416932945382355908790599225266501822907911457504978515578255421292")
    const contractAddr = "0xE800b887db490d9523212813a7907AFDB7493E45"
    // const { identities, members } = createIdentities(chainID, 3)

    const wasmFilePath = `${config.paths.build["snark-artifacts"]}/${treeDepth}/2/semaphore_20_2.wasm`
    const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/${treeDepth}/2/circuit_final.zkey`
    signersA = ganacheAccounts.map(ganacheAccount => new Wallet(ganacheAccount["secretKey"], providerA))
    signersB = ganacheAccounts.map(ganacheAccount => new Wallet(ganacheAccount["secretKey"], providerB))

    before(async () => {

        contractA = await hreEthers.getContractAt("Semaphore", contractAddr, signersA[0])
        contractB = await hreEthers.getContractAt("Semaphore", contractAddr, signersB[0])
        accounts = await Promise.all(signersA.map((signer: Signer) => signer.getAddress()))
        // console.log(contractA)
        // console.log(contractB)
        const transactionA = contractA.connect(signersA[1]).createGroup(groupId, treeDepth, 0, accounts[1], maxEdges)
        await expect(transactionA).to.emit(contractA, "GroupCreated").withArgs(groupId, treeDepth, 0)
        await expect(transactionA)
            .to.emit(contractA, "GroupAdminUpdated")
            .withArgs(groupId, constants.AddressZero, accounts[1])
        const rootA = await contractA.getRoot(groupId)
        expect(rootA).to.equal("8055374341341620501424923482910636721817757020788836089492629714380498049891")

        const transactionB = contractB.connect(signersB[1]).createGroup(groupId, treeDepth, 0, accounts[1], maxEdges)
        await expect(transactionB).to.emit(contractB, "GroupCreated").withArgs(groupId, treeDepth, 0)
        await expect(transactionB)
            .to.emit(contractB, "GroupAdminUpdated")
            .withArgs(groupId, constants.AddressZero, accounts[1])
        const rootB = await contractB.getRoot(groupId)
        expect(rootB).to.equal("8055374341341620501424923482910636721817757020788836089492629714380498049891")

        const tx1a = contractA.connect(signersA[1]).addMember(groupId, membersA[0])
        groupA = new Group(treeDepth, BigInt(zeroValue))
        groupA.addMember(membersA[0])

        await expect(tx1a).to.emit(contractA, "MemberAdded").withArgs(
            groupId,
            membersA[0],
            groupA.root
        )
        groupA.addMember(membersA[1])
        const tx2a = contractA.connect(signersA[1]).addMember(groupId, membersA[1])
        await expect(tx2a).to.emit(contractA, "MemberAdded").withArgs(
            groupId,
            membersA[1],
            groupA.root
        )
        //
        groupA.addMember(membersA[2])
        const tx3a = contractA.connect(signersA[1]).addMember(groupId, membersA[2])
        await expect(tx3a).to.emit(contractA, "MemberAdded").withArgs(
            groupId,
            membersA[2],
            groupA.root
        )

        const tx1b = contractB.connect(signersB[1]).addMember(groupId, membersB[0])
        groupB = new Group(treeDepth, BigInt(zeroValue))
        groupB.addMember(membersB[0])

        await expect(tx1b).to.emit(contractB, "MemberAdded").withArgs(
            groupId,
            membersB[0],
            groupB.root
        )
        groupB.addMember(membersB[1])
        const tx2b = contractB.connect(signersB[1]).addMember(groupId, membersB[1])
        await expect(tx2b).to.emit(contractB, "MemberAdded").withArgs(
            groupId,
            membersB[1],
            groupB.root
        )
        //
        groupB.addMember(membersB[2])
        const tx3b = contractB.connect(signersB[1]).addMember(groupId, membersB[2])
        await expect(tx3b).to.emit(contractB, "MemberAdded").withArgs(
            groupId,
            membersB[2],
            groupB.root
        )
    })
    describe("# CrossChainVerifyRoots", () => {
        let roots_chainA: string[]
        let rootA: BigNumber
        let rootB: BigNumber
        // const groupId2 = groupId * 100000

        before(async () => {
            rootA = await contractA.getRoot(groupId)
            rootB = await contractB.getRoot(groupId)
            roots_chainA = [rootA.toHexString(), rootB.toHexString()]
        })
        it("Should decode roots correctly", async () => {
            console.log("message: ", createRootsBytes(roots_chainA))
            console.log("message: ", createRootsBytes(roots_chainA).length)
            const transaction = contractA.connect(signersA[1]).decodeRoots(
                createRootsBytes(roots_chainA)
            )
            // console.log(transaction)
            const roots_decoded = await transaction;
            console.log(roots_chainA)
            console.log(roots_decoded)
            expect(roots_decoded[0]).to.be.equal(roots_chainA[0])
            expect(roots_decoded[1]).to.be.equal(roots_chainA[1])
            expect(roots_decoded.length).to.be.equal(roots_chainA.length)
        })
        it("Should not verify if updateEdges has not been called", async () => {
            console.log("message: ", createRootsBytes(roots_chainA))
            console.log("message: ", createRootsBytes(roots_chainA).length)
            const transaction = contractB.connect(signersB[1]).verifyRoots(
                groupId,
                createRootsBytes(roots_chainA),
            )
            console.log(transaction)
            const receipt_tx = await transaction;
            console.log(receipt_tx)
            await expect(transaction).to.be.revertedWith("Semaphore__InvalidCurrentChainRoot()")
        })
    })

    describe("# CrossChainVerify", () => {
        const signal = "Hello world"
        const bytes32Signal = utils.formatBytes32String(signal)

        let fullProof_chainA: FullProof
        let solidityProof_chainA: SolidityProof
        let roots_chainA: string[]

        before(async () => {
            const tx1a = contractA.connect(signersA[1]).addMember(groupId, membersA[0])
            const groupA = new Group(treeDepth, BigInt(zeroValue))
            groupA.addMember(membersA[0])

            await expect(tx1a).to.emit(contractA, "MemberAdded").withArgs(
                groupId,
                membersA[0],
                groupA.root
            )
            groupA.addMember(membersA[1])
            const tx2a = contractA.connect(signersA[1]).addMember(groupId, membersA[1])
            await expect(tx2a).to.emit(contractA, "MemberAdded").withArgs(
                groupId,
                membersA[1],
                groupA.root
            )
            //
            groupA.addMember(membersA[2])
            const tx3a = contractA.connect(signersA[1]).addMember(groupId, membersA[2])
            await expect(tx3a).to.emit(contractA, "MemberAdded").withArgs(
                groupId,
                membersA[2],
                groupA.root
            )

            const tx1b = contractB.connect(signersB[1]).addMember(groupId, membersB[0])
            const groupB = new Group(treeDepth, BigInt(zeroValue))
            groupB.addMember(membersB[0])

            await expect(tx1b).to.emit(contractB, "MemberAdded").withArgs(
                groupId,
                membersB[0],
                groupB.root
            )
            groupB.addMember(membersB[1])
            const tx2b = contractB.connect(signersB[1]).addMember(groupId, membersB[1])
            await expect(tx2b).to.emit(contractB, "MemberAdded").withArgs(
                groupId,
                membersB[1],
                groupB.root
            )
            //
            groupB.addMember(membersB[2])
            const tx3b = contractB.connect(signersB[1]).addMember(groupId, membersB[2])
            await expect(tx3b).to.emit(contractB, "MemberAdded").withArgs(
                groupId,
                membersB[2],
                groupB.root
            )
            const rootA = await contractA.getRoot(groupId)
            const rootB = await contractB.getRoot(groupId)
            roots_chainA = [rootA.toHexString(), rootB.toHexString()]

            fullProof_chainA = await generateProof(identitiesA[0], groupA, groupA.root, signal, {
                wasmFilePath,
                zkeyFilePath
            })
            solidityProof_chainA = packToSolidityProof(fullProof_chainA.proof)
        })

        it("Should not verify if updateEdges has not been called", async () => {
            const transaction = contractB.verifyProof(
                groupId,
                bytes32Signal,
                fullProof_chainA.publicSignals.nullifierHash,
                fullProof_chainA.publicSignals.externalNullifier,
                createRootsBytes(roots_chainA),
                solidityProof_chainA
            )
            await expect(transaction).to.be.revertedWith("Semaphore__InvalidCurrentChainRoot()")
        })

        it("Should verify", async () => {
            const tx_update = contractB.updateEdge(
                groupId,
                chainIDA,
                roots_chainA[0],
                2,
                toFixedHex(BigInt(0), 32)
            )
            console.log(tx_update)
            const receipt_tx_update = await tx_update;
            console.log(receipt_tx_update)
            const receipt_update = await receipt_tx_update.wait();
            console.log(receipt_update)

            const transaction = contractB.verifyProof(
                groupId,
                bytes32Signal,
                fullProof_chainA.publicSignals.nullifierHash,
                fullProof_chainA.publicSignals.externalNullifier,
                createRootsBytes(roots_chainA),
                solidityProof_chainA
            )
            await expect(transaction).to.be.revertedWith("InvalidProof()")
        })
    })
})
