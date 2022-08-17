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
    let root1A: BigNumber
    let root1B: BigNumber
    let root2A: BigNumber
    let root2B: BigNumber
    let root3A: BigNumber
    let root3B: BigNumber
    let root4A: BigNumber
    let root4B: BigNumber
    let allRootsA: string[] 
    let allRootsB: string[] 

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
    const zeroValue = BigInt("21663839004416932945382355908790599225266501822907911457504978515578255421292")
    const contractAddr = "0xE800b887db490d9523212813a7907AFDB7493E45"

    const wasmFilePath = `${config.paths.build["snark-artifacts"]}/${treeDepth}/2/semaphore_20_2.wasm`
    const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/${treeDepth}/2/circuit_final.zkey`
    signersA = ganacheAccounts.map(ganacheAccount => new Wallet(ganacheAccount["secretKey"], providerA))
    signersB = ganacheAccounts.map(ganacheAccount => new Wallet(ganacheAccount["secretKey"], providerB))

    before(async () => {

        contractA = await hreEthers.getContractAt("Semaphore", contractAddr, signersA[0])
        contractB = await hreEthers.getContractAt("Semaphore", contractAddr, signersB[0])
        accounts = await Promise.all(signersA.map((signer: Signer) => signer.getAddress()))
        groupA = new Group(treeDepth, BigInt(zeroValue))
        const transactionA = contractA.connect(signersA[1]).createGroup(groupId, treeDepth, 0, accounts[1], maxEdges)
        await expect(transactionA).to.emit(contractA, "GroupCreated").withArgs(groupId, treeDepth, 0)
        await expect(transactionA)
            .to.emit(contractA, "GroupAdminUpdated")
            .withArgs(groupId, constants.AddressZero, accounts[1])

        const rootA = await contractA.getRoot(groupId)
        expect(rootA).to.equal(groupA.root)

        const transactionB = contractB.connect(signersB[1]).createGroup(groupId, treeDepth, 0, accounts[1], maxEdges)
        await expect(transactionB).to.emit(contractB, "GroupCreated").withArgs(groupId, treeDepth, 0)
        await expect(transactionB)
            .to.emit(contractB, "GroupAdminUpdated")
            .withArgs(groupId, constants.AddressZero, accounts[1])
        const rootB = await contractB.getRoot(groupId)

        groupB = new Group(treeDepth, BigInt(zeroValue))
        expect(rootB).to.equal(groupB.root)

        const tx1a = contractA.connect(signersA[1]).addMember(groupId, membersA[0])
        groupA.addMember(membersA[0])
        await expect(tx1a).to.emit(contractA, "MemberAdded").withArgs(
            groupId,
            membersA[0],
            groupA.root
        )
        root1A = BigNumber.from(groupA.root.toString())

        groupA.addMember(membersA[1])
        const tx2a = contractA.connect(signersA[1]).addMember(groupId, membersA[1])
        await expect(tx2a).to.emit(contractA, "MemberAdded").withArgs(
            groupId,
            membersA[1],
            groupA.root
        )
        root2A = BigNumber.from(groupA.root.toString())
        //
        groupA.addMember(membersA[2])
        const tx3a = contractA.connect(signersA[1]).addMember(groupId, membersA[2])
        await expect(tx3a).to.emit(contractA, "MemberAdded").withArgs(
            groupId,
            membersA[2],
            groupA.root
        )
        root3A = BigNumber.from(groupA.root.toString())

        groupA.addMember(membersA[3])
        const tx4a = contractA.connect(signersA[1]).addMember(groupId, membersA[3])
        await expect(tx4a).to.emit(contractA, "MemberAdded").withArgs(
            groupId,
            membersA[3],
            groupA.root
        )

        root4A = BigNumber.from(groupA.root.toString())

        const tx1b = contractB.connect(signersB[1]).addMember(groupId, membersB[0])
        groupB.addMember(membersB[0])

        await expect(tx1b).to.emit(contractB, "MemberAdded").withArgs(
            groupId,
            membersB[0],
            groupB.root
        )
        root1B = BigNumber.from(groupB.root.toString())

        groupB.addMember(membersB[1])
        const tx2b = contractB.connect(signersB[1]).addMember(groupId, membersB[1])
        await expect(tx2b).to.emit(contractB, "MemberAdded").withArgs(
            groupId,
            membersB[1],
            groupB.root
        )
        root2B = BigNumber.from(groupB.root.toString())
        //
        groupB.addMember(membersB[2])
        const tx3b = contractB.connect(signersB[1]).addMember(groupId, membersB[2])
        await expect(tx3b).to.emit(contractB, "MemberAdded").withArgs(
            groupId,
            membersB[2],
            groupB.root
        )
        root3B = BigNumber.from(groupB.root.toString())


        groupB.addMember(membersB[3])
        const tx4b = contractB.connect(signersB[1]).addMember(groupId, membersB[3])
        await expect(tx4b).to.emit(contractB, "MemberAdded").withArgs(
            groupId,
            membersB[3],
            groupB.root
        )
        root4B = BigNumber.from(groupB.root.toString())

        allRootsA = [root1A.toHexString(), root2A.toHexString(), root3A.toHexString(), root4A.toHexString()]
        allRootsB = [root1B.toHexString(), root2B.toHexString(), root3B.toHexString(), root4B.toHexString()]
    })
    describe("# CrossChainVerifyRoots", () => {
        let roots: string[]
        let rootA: BigNumber
        let rootB: BigNumber
        // const groupId2 = groupId * 100000

        before(async () => {
            rootA = await contractA.getRoot(groupId)
            rootB = await contractB.getRoot(groupId)
            roots = [rootA.toHexString(), rootB.toHexString()]
        })
        it("Should decode roots correctly", async () => {
            const roots_decoded = await contractA.connect(signersA[1]).decodeRoots(
                createRootsBytes(roots)
            )
            expect(roots_decoded[0]).to.be.equal(roots[0])
            expect(roots_decoded[1]).to.be.equal(roots[1])
            expect(roots_decoded.length).to.be.equal(roots.length)
        })
        it("Should not verify if updateEdge has not been called", async () => {
            const transaction = contractA.connect(signersA[1]).verifyRoots(
                groupId,
                createRootsBytes(roots),
            )
            await expect(transaction).to.be.revertedWith("Not initialized edges must be set to default root")
        })

        it("Should verify external root after updateEdge", async () => {
            const tx_update = await contractB.connect(signersB[1]).updateEdge(
                groupId,
                chainIDA,
                allRootsA[0],
                0,
                toFixedHex(BigInt(0), 32)
            )
            expect(tx_update).to.equal(true)
            const roots = [allRootsB[0], allRootsA[0]]

            const is_valid = await contractB.connect(signersB[1]).verifyRoots(
                groupId,
                createRootsBytes(roots),
            )
            expect(is_valid).to.equal(true)
        })

        it("Should not verify invalid order of roots", async () => {
            const roots = [allRootsA[0], allRootsB[0]]
            const transaction = contractB.connect(signersB[1]).verifyRoots(
                groupId,
                createRootsBytes(roots),
            )
            await expect(transaction).to.be.revertedWith("Cannot find your merkle root")
        })
        it("Should not verify out of date edges", async () => {
            const rootA = await contractA.getRoot(groupId)
            const rootB = await contractB.getRoot(groupId)
            roots = [rootB.toHexString(), rootA.toHexString()]

            const transaction = contractB.connect(signersB[1]).verifyRoots(
                groupId,
                createRootsBytes(roots),
            )
            await expect(transaction).to.be.revertedWith("Neighbour root not found")
        })
        it("Should verify not sequential updates", async () => {
            const tx_update = await contractB.connect(signersB[1]).updateEdge(
                groupId,
                chainIDA,
                allRootsA[2],
                2,
                toFixedHex(BigInt(0), 32)
            )

            expect(tx_update).to.equal(true)
            const roots = [allRootsB[3], allRootsA[2]]

            const is_valid = await contractB.connect(signersB[1]).verifyRoots(
                groupId,
                createRootsBytes(roots),
            )
            expect(is_valid).to.equal(true)
        })
    })

    describe("# CrossChainVerify", () => {
        const signal = "Hello world"
        const bytes32Signal = utils.formatBytes32String(signal)

        let fullProof_chainA: FullProof
        let solidityProof_chainA: SolidityProof
        let roots: string[]

        before(async () => {
            roots = [allRootsB[0], allRootsA[0]]

            fullProof_chainA = await generateProof(identitiesA[0], groupA, allRootsB[0], allRootsA[0], signal, {
                wasmFilePath,
                zkeyFilePath
            })
            solidityProof_chainA = packToSolidityProof(fullProof_chainA.proof)
        })

        it("Should not verify if updateEdges has not been called", async () => {
            console.log(roots)
            const transaction = contractB.connect(signersB[1]).verifyProof(
                groupId,
                bytes32Signal,
                fullProof_chainA.publicSignals.nullifierHash,
                fullProof_chainA.publicSignals.externalNullifier,
                createRootsBytes(roots),
                solidityProof_chainA
            )
            console.log(transaction)
            const receipt_tx = await transaction
            console.log(receipt_tx)
            const receipt = await receipt_tx.wait()
            console.log(receipt)
            await expect(transaction).to.be.revertedWith("Not initialized edges must be set to default root")
        })
        // it("Should not verify if roots are reversed", async () => {
        //     const transaction = contractB.verifyProof(
        //         groupId,
        //         bytes32Signal,
        //         fullProof_chainA.publicSignals.nullifierHash,
        //         fullProof_chainA.publicSignals.externalNullifier,
        //         createRootsBytes(roots.reverse()),
        //         solidityProof_chainA
        //     )
        //     console.log(transaction)
        //     const receipt_tx = await transaction
        //     console.log(receipt_tx)
        //     const receipt = await receipt_tx.wait()
        //     console.log(receipt)
        //     await expect(transaction).to.be.revertedWith("Not initialized edges must be set to default root")
        // })
        //
        // it("Should verify", async () => {
        //     const tx_update = contractB.connect(signersB[1]).updateEdge(
        //         groupId,
        //         chainIDA,
        //         roots[0],
        //         2,
        //         toFixedHex(BigInt(0), 32)
        //     )
        //     // console.log(tx_update)
        //     const receipt_tx_update = await tx_update;
        //     console.log(receipt_tx_update)
        //     const receipt_update = await receipt_tx_update.wait();
        //     console.log(receipt_update)
        //
        //     const transaction = contractB.verifyProof(
        //         groupId,
        //         bytes32Signal,
        //         fullProof_chainA.publicSignals.nullifierHash,
        //         fullProof_chainA.publicSignals.externalNullifier,
        //         createRootsBytes(roots),
        //         solidityProof_chainA
        //     )
        //     console.log(transaction)
        //     await expect(transaction).to.emit(contractB, "ProofVerified()").withArgs(groupId, bytes32Signal)
        // })
    })
})
