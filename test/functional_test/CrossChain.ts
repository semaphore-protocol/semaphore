import { expect } from "chai"
import { constants, Signer, utils, BigNumber, providers, Wallet } from "ethers"
import { ethers as hreEthers } from "hardhat"
import { Semaphore as SemaphoreContract } from "../build/typechain"
import { config } from "../package.json"
// import { SnarkArtifacts } from "@semaphore-protocol/proof"
import { Identity } from "../packages/identity/src"
import { Group } from "../packages/group/src"
import { FullProof, generateProof, packToSolidityProof, SolidityProof } from "../packages/proof/src/"
import { toFixedHex, createRootsBytes, createIdentities } from "./utils"
import { private_keys as ganacheAccounts } from "../accounts.json";

describe("CrossChain", () => {
    let contractA: SemaphoreContract
    let contractB: SemaphoreContract
    let accounts: string[]
    let groupA: Group
    let groupB: Group

    let membersA: bigint[]
    let membersB: bigint[]
    let identitiesA: Identity[]
    let identitiesB: Identity[]
    let chainIDA: number
    let chainIDB: number
    let allRootsA: string[]
    let allRootsB: string[]

    const treeDepth = Number(process.env.TREE_DEPTH) | 20
    const groupId = 9
    const maxEdges = 1
    const providerA = new providers.JsonRpcProvider("http://127.0.0.1:8545");
    const providerB = new providers.JsonRpcProvider("http://127.0.0.1:8546");
    const zeroValue = BigInt("21663839004416932945382355908790599225266501822907911457504978515578255421292")
    const contractAddr = "0xE800b887db490d9523212813a7907AFDB7493E45"

    const wasmFilePath = `${config.paths.build["snark-artifacts"]}/${treeDepth}/2/semaphore_20_2.wasm`
    const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/${treeDepth}/2/circuit_final.zkey`
    const signersA = ganacheAccounts.map(ganacheAccount => new Wallet(ganacheAccount["secretKey"], providerA))
    const signersB = ganacheAccounts.map(ganacheAccount => new Wallet(ganacheAccount["secretKey"], providerB))

    before(async () => {
        // Starting contracts / accounts
        contractA = await hreEthers.getContractAt("Semaphore", contractAddr, signersA[1])
        contractB = await hreEthers.getContractAt("Semaphore", contractAddr, signersB[1])
        accounts = await Promise.all(signersA.map((signer: Signer) => signer.getAddress()))

        chainIDA = await contractA.connect(signersA[1]).getChainIdType()
        chainIDB = await contractB.connect(signersB[1]).getChainIdType()

        // Creating members
        const idsA = createIdentities(chainIDA, 5)
        const idsB = createIdentities(chainIDB, 5)
        membersA = idsA.members
        identitiesA = idsA.identities
        membersB = idsB.members
        identitiesB = idsB.identities

        // Creating group on-chain and locally
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
        allRootsB = [rootB.toHexString()];

        const tx1a = contractA.connect(signersA[1]).addMember(groupId, membersA[0])
        groupA.addMember(membersA[0])
        await expect(tx1a).to.emit(contractA, "MemberAdded").withArgs(
            groupId,
            membersA[0],
            groupA.root
        )
        allRootsA = [BigNumber.from(groupA.root).toHexString()];

        groupA.addMember(membersA[1])
        const tx2a = contractA.connect(signersA[1]).addMember(groupId, membersA[1])
        await expect(tx2a).to.emit(contractA, "MemberAdded").withArgs(
            groupId,
            membersA[1],
            groupA.root
        )
        allRootsA.push(BigNumber.from(groupA.root).toHexString());
        groupA.addMember(membersA[2])
        const tx3a = contractA.connect(signersA[1]).addMember(groupId, membersA[2])
        await expect(tx3a).to.emit(contractA, "MemberAdded").withArgs(
            groupId,
            membersA[2],
            groupA.root
        )
        allRootsA.push(BigNumber.from(groupA.root).toHexString());

        const tx1b = contractB.connect(signersB[1]).addMember(groupId, membersB[0])
        groupB.addMember(membersB[0])
        allRootsB = [BigNumber.from(groupB.root).toHexString()];

        await expect(tx1b).to.emit(contractB, "MemberAdded").withArgs(
            groupId,
            membersB[0],
            groupB.root
        )
        groupB.addMember(membersB[1])
        allRootsB.push(BigNumber.from(groupB.root).toHexString());
        const tx2b = contractB.connect(signersB[1]).addMember(groupId, membersB[1])
        await expect(tx2b).to.emit(contractB, "MemberAdded").withArgs(
            groupId,
            membersB[1],
            groupB.root
        )
        groupB.addMember(membersB[2])
        allRootsB.push(BigNumber.from(groupB.root).toHexString());
        const tx3b = contractB.connect(signersB[1]).addMember(groupId, membersB[2])
        await expect(tx3b).to.emit(contractB, "MemberAdded").withArgs(
            groupId,
            membersB[2],
            groupB.root
        )
    })
    describe("# CrossChainVerifyRoots", () => {
        let roots: string[]
        let roots_zero: string[]
        let rootA: BigNumber
        let rootB: BigNumber

        before(async () => {
            rootA = await contractA.getRoot(groupId)
            rootB = await contractB.getRoot(groupId)
            roots = [rootA.toHexString(), rootB.toHexString()]
            roots_zero = [rootA.toHexString(), toFixedHex(0, 32)]
        })
        it("Should not verify if updateEdge has not been called", async () => {
            const transaction = contractA.connect(signersA[1]).verifyRoots(
                groupId,
                createRootsBytes(roots),
                maxEdges
            )
            await expect(transaction).to.be.revertedWith("Not initialized edges must be set to 0")
        })

        it("Should verify external root after updateEdge", async () => {
            const tx_update = await contractB.connect(signersB[1]).updateEdge(
                groupId,
                chainIDA,
                allRootsA[0],
                0,
                toFixedHex(BigInt(0), 32)
            )
            const roots = [allRootsB[0], allRootsA[0]]

            const is_valid = await contractB.connect(signersB[1]).verifyRoots(
                groupId,
                createRootsBytes(roots),
                maxEdges
            )
            expect(is_valid).to.equal(true)
        })

        it("Should not verify invalid order of roots", async () => {
            const roots = [allRootsA[0], allRootsB[0]]
            const transaction = contractB.connect(signersB[1]).verifyRoots(
                groupId,
                createRootsBytes(roots),
                maxEdges
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
                maxEdges
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

            const roots = [allRootsB[2], allRootsA[2]]

            const is_valid = await contractB.connect(signersB[1]).verifyRoots(
                groupId,
                createRootsBytes(roots),
                maxEdges
            )
            expect(is_valid).to.equal(true)
        })
    })
    describe("# CrossChainVerify", () => {
        const signal = "Hello world" + Date.now()
        console.log(signal)
        const bytes32Signal = utils.formatBytes32String(signal)

        let fullProof_local_chainA: FullProof
        let solidityProof_local_chainA: SolidityProof
        let chainA_not_updated_roots: string[]

        let fullProof_local_chainB: FullProof
        let solidityProof_local_chainB: SolidityProof
        let chainB_not_updated_roots: string[]

        before(async () => {
            const rootA = await contractA.getRoot(groupId)
            const rootB = await contractB.getRoot(groupId)
            chainA_not_updated_roots = [rootA.toHexString(), toFixedHex(BigNumber.from(0), 32)]
            fullProof_local_chainA = await generateProof(identitiesA[0], groupA, chainA_not_updated_roots, BigInt(Date.now()*100), signal, {
                wasmFilePath,
                zkeyFilePath
            })
            solidityProof_local_chainA = packToSolidityProof(fullProof_local_chainA.proof)

            chainB_not_updated_roots = [rootB.toHexString(), allRootsA[0]]
            fullProof_local_chainB = await generateProof(identitiesB[2], groupB, chainB_not_updated_roots, BigInt(Date.now()*100), signal, {
                wasmFilePath,
                zkeyFilePath
            })

            solidityProof_local_chainB = packToSolidityProof(fullProof_local_chainB.proof)
        })

        it("Should verify local proof chainA", async () => {
            const transaction = contractA.connect(signersA[1]).verifyProof(
                groupId,
                bytes32Signal,
                fullProof_local_chainA.publicSignals.nullifierHash,
                fullProof_local_chainA.publicSignals.externalNullifier,
                createRootsBytes(fullProof_local_chainA.publicSignals.roots),
                fullProof_local_chainA.publicSignals.calculatedRoot,
                fullProof_local_chainA.publicSignals.chainID,
                solidityProof_local_chainA
            )
            await expect(transaction).to.emit(contractA, "ProofVerified").withArgs(groupId, bytes32Signal)
        })

        it("Should verify local proof chainB", async () => {
            const transaction = contractB.connect(signersB[1]).verifyProof(
                groupId,
                bytes32Signal,
                fullProof_local_chainB.publicSignals.nullifierHash,
                fullProof_local_chainB.publicSignals.externalNullifier,
                createRootsBytes(fullProof_local_chainB.publicSignals.roots),
                fullProof_local_chainB.publicSignals.calculatedRoot,
                fullProof_local_chainB.publicSignals.chainID,
                solidityProof_local_chainB
            )
            await expect(transaction).to.emit(contractB, "ProofVerified").withArgs(groupId, bytes32Signal)
        })

        it("Should verify if edges are updated2", async () => {
            groupA.addMember(membersA[3])
            const tx4a = contractA.connect(signersA[1]).addMember(groupId, membersA[3])
            await expect(tx4a).to.emit(contractA, "MemberAdded").withArgs(
                groupId,
                membersA[3],
                groupA.root
            )

            groupB.addMember(membersB[3])
            const tx4b = contractB.connect(signersB[1]).addMember(groupId, membersB[3])
            await expect(tx4b).to.emit(contractB, "MemberAdded").withArgs(
                groupId,
                membersB[3],
                groupB.root
            )

            const tx_update = contractB.connect(signersB[1]).updateEdge(
                groupId,
                chainIDA,
                BigNumber.from(groupA.root).toHexString(),
                3,
                toFixedHex(BigInt(0), 32)
            )
            const rootA = await contractA.getRoot(groupId)
            const rootB = await contractB.getRoot(groupId)

            const chainB_roots = [rootB.toHexString(), rootA.toHexString()]
            const fullProof = await generateProof(identitiesA[0], groupA, chainB_roots, BigInt(Date.now()*3), signal, {
                wasmFilePath,
                zkeyFilePath
            })
            const solidityProof = packToSolidityProof(fullProof.proof)

            const transaction = contractB.connect(signersB[1]).verifyProof(
                groupId,
                bytes32Signal,
                fullProof.publicSignals.nullifierHash,
                fullProof.publicSignals.externalNullifier,
                createRootsBytes(fullProof.publicSignals.roots),
                fullProof.publicSignals.calculatedRoot,
                fullProof.publicSignals.chainID,
                solidityProof
            )
            await expect(transaction).to.emit(contractB, "ProofVerified").withArgs(groupId, bytes32Signal)
        })
    })
})
