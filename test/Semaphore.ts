import { Group } from "@semaphore-protocol/group"
import Identity from "./identity"
import { FullProof, generateSignalHash, packToSolidityProof, SolidityProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { groth16 } from "snarkjs"
import { constants, Signer, utils } from "ethers"
import { run } from "hardhat"
import { Semaphore as SemaphoreContract } from "../build/typechain"
import { config } from "../package.json"
import { createIdentityCommitments } from "./utils"
import { SnarkArtifacts } from "@semaphore-protocol/proof"
import { BigNumber, BigNumberish } from "ethers";

/** BigNumber to hex string of specified length */
const toFixedHex = (number: BigNumberish, length = 32): string =>
  '0x' +
  (number instanceof Buffer
    ? number.toString('hex')
    : BigNumber.from(number).toHexString().slice(2)
  ).padStart(length * 2, '0')

function createRootsBytes(rootArray: string[] | BigNumberish[]): string {
    let rootsBytes = '0x';
    for (let i = 0; i < rootArray.length; i++) {
        rootsBytes += toFixedHex(rootArray[i], 32).substr(2);
    }
    return rootsBytes; // root byte string (32 * array.length bytes)
    }

async function generateProof(
    identity: Identity,
    group: Group,
    externalNullifier: BigNumberish,
    signal: string,
    snarkArtifacts: SnarkArtifacts
): Promise<FullProof> {
    const commitment = identity.generateCommitment()
    const index = group.indexOf(commitment)

    if (index === -1) {
        throw new Error("The identity is not part of the group")
    }

    const merkleProof = group.generateProofOfMembership(index)
    // console.log("path INDICES: ", merkleProof.pathIndices)

    const { proof, publicSignals } = await groth16.fullProve(
        {
            identityTrapdoor: identity.getTrapdoor(),
            identityNullifier: identity.getNullifier(),
            treePathIndices: merkleProof.pathIndices,
            treeSiblings: merkleProof.siblings,
            roots: [merkleProof.root, 0],
            chainID: identity.chainID,
            externalNullifier,
            signalHash: generateSignalHash(signal)
        },
        snarkArtifacts.wasmFilePath,
        snarkArtifacts.zkeyFilePath
    )

    return {
        proof,
        publicSignals: {
            merkleRoot: publicSignals[0],
            nullifierHash: publicSignals[1],
            signalHash: publicSignals[2],
            externalNullifier: publicSignals[3]
        }
    }
}

describe("Semaphore", () => {
    let contract: SemaphoreContract
    let signers: Signer[]
    let accounts: string[]

    const treeDepth = Number(process.env.TREE_DEPTH)
    const groupId = 1
    const maxEdges = 1;
    const chainID = 1337;
    const members = createIdentityCommitments(chainID, 3)

    // const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
    // const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`
    const wasmFilePath = `./build/circuit_artifacts/semaphore_js/semaphore.wasm`
    const zkeyFilePath = `./build/circuit_artifacts/artifacts/circuit_final.zkey`

    before(async () => {
        const { address: verifierAddress } = await run("deploy:verifier", { logs: false, depth: treeDepth })
        contract = await run("deploy:semaphore", {
            logs: false,
            verifiers: [{ merkleTreeDepth: treeDepth, contractAddress: verifierAddress }]
        })

        signers = await run("accounts", { logs: false })
        accounts = await Promise.all(signers.map((signer: Signer) => signer.getAddress()))
    })

    describe("# createGroup", () => {
        it("Should not create a group if the tree depth is not supported", async () => {
            const transaction = contract.createGroup(groupId, 10, 0, accounts[0], maxEdges)

            await expect(transaction).to.be.revertedWith("Semaphore__TreeDepthIsNotSupported()")
        })

        it("Should create a group", async () => {
            const transaction = contract.connect(signers[1]).createGroup(groupId, treeDepth, 0, accounts[1], maxEdges)

            await expect(transaction).to.emit(contract, "GroupCreated").withArgs(groupId, treeDepth, 0)
            await expect(transaction)
                .to.emit(contract, "GroupAdminUpdated")
                .withArgs(groupId, constants.AddressZero, accounts[1])
        })
    })

    describe("# updateGroupAdmin", () => {
        it("Should not update a group admin if the caller is not the group admin", async () => {
            const transaction = contract.updateGroupAdmin(groupId, accounts[0])

            await expect(transaction).to.be.revertedWith("Semaphore__CallerIsNotTheGroupAdmin()")
        })

        it("Should update the group admin", async () => {
            const transaction = contract.connect(signers[1]).updateGroupAdmin(groupId, accounts[0])

            await expect(transaction).to.emit(contract, "GroupAdminUpdated").withArgs(groupId, accounts[1], accounts[0])
        })
    })

    describe("# addMember", () => {
        it("Should not add a member if the caller is not the group admin", async () => {
            const member = BigInt(2)

            const transaction = contract.connect(signers[1]).addMember(groupId, member)

            await expect(transaction).to.be.revertedWith("Semaphore__CallerIsNotTheGroupAdmin()")
        })

        it("Should add a new member in an existing group", async () => {
            const transaction = contract.addMember(groupId, members[0])

            const zero = "21663839004416932945382355908790599225266501822907911457504978515578255421292"
            const group = new Group(treeDepth, BigInt(zero))
            group.addMember(members[0])

            await expect(transaction)
                .to.emit(contract, "MemberAdded")
                .withArgs(
                    groupId,
                    members[0],
                    // TODO: Double check if root is actually supposed to be different
                    // prev_root:
                    // "18951329906296061785889394467312334959162736293275411745101070722914184798221"
                    // new root:
                    group.root
                    // "13363801133440369172344440658363322195671530462716685761435662705051278097748"
                )
        })
    })

    describe("# removeMember", () => {
        it("Should not remove a member if the caller is not the group admin", async () => {
            const transaction = contract.connect(signers[1]).removeMember(groupId, members[0], [0, 1], [0, 1])

            await expect(transaction).to.be.revertedWith("Semaphore__CallerIsNotTheGroupAdmin()")
        })

        it("Should remove a member from an existing group", async () => {
            const groupId = 100
            // NOTE: hex (zero value) taken from contracts/base/LinkableIncrementalBinaryTree.sol 
            // first position in the zeros function

            // let hex = "2fe54c60d3acabf3343a35b6eba15db4821b340f76e741e2249685ed4899af6c";
            // if (hex.length % 2) { hex = '0' + hex; }
            // const bn = BigInt('0x' + hex);
            // const zero= bn.toString(10);
            const zero = "21663839004416932945382355908790599225266501822907911457504978515578255421292"
            const group = new Group(treeDepth, BigInt(zero))

            group.addMembers([BigInt(1), BigInt(2), BigInt(3)])

            group.removeMember(0)

            await contract.createGroup(groupId, treeDepth, 0, accounts[0], maxEdges)
            await contract.addMember(groupId, BigInt(1))
            await contract.addMember(groupId, BigInt(2))
            await contract.addMember(groupId, BigInt(3))

            const { siblings, pathIndices, root } = group.generateProofOfMembership(0)

            const transaction = contract.removeMember(groupId, BigInt(1), siblings, pathIndices)

            await expect(transaction).to.emit(contract, "MemberRemoved").withArgs(groupId, BigInt(1), root)
        })
    })

    describe("# verifyProof", () => {
        const signal = "Hello world"
        const bytes32Signal = utils.formatBytes32String(signal)
        const identity = new Identity(BigInt(chainID), "0")
        const groupId2 = groupId + 1

        const group = new Group(treeDepth)

        group.addMembers(members)

        let fullProof: FullProof
        let solidityProof: SolidityProof

        before(async () => {
            // const transaction = await contract.getMaxEdges(groupId)
            const transaction = await contract.createGroup(groupId2, treeDepth, 0, accounts[0], maxEdges)
            // console.log(transaction)
            const edges = await contract.getMaxEdges(groupId2)
            // console.log("edges: ", edges)
            await contract.addMember(groupId2, members[1])
            await contract.addMember(groupId2, members[2])

            fullProof = await generateProof(identity, group, group.root, signal, {
                wasmFilePath,
                zkeyFilePath
            })
            solidityProof = packToSolidityProof(fullProof.proof)
        })

        it("Should not verify a proof if the group does not exist", async () => {
            const roots = await contract.getRoot(groupId2);
            // console.log("roots: ,", roots);
            const transaction = contract.verifyProof(
                10,
                bytes32Signal,
                0,
                0,
                roots.toHexString(),
                [0, 0, 0, 0, 0, 0, 0, 0],
            )

            // console.log("transaction: ,", transaction);
            // const receipt = await transaction;
            // console.log("receipt: ,", receipt);
            await expect(transaction).to.be.revertedWith("Semaphore__GroupDoesNotExist()")
        })

        it("Should throw an exception if the proof is not valid", async () => {
            const root = await contract.getRoot(groupId2);
            const roots = [root.toHexString(), BigNumber.from(0).toHexString()] 
            // console.log("roots: ,", roots);
            const transaction = contract.verifyProof(
                groupId2,
                bytes32Signal,
                fullProof.publicSignals.nullifierHash,
                0,
                createRootsBytes(roots),
                solidityProof
            )
            console.log("transaction: ", await transaction);
            // const receipt = await transaction;
            // console.log("receipt: ,", receipt);

            await expect(transaction).to.be.revertedWith("InvalidProof()")
        })

        it("Should verify a proof for an onchain group correctly", async () => {
            const roots = await contract.getRoot(groupId2);
            const transaction = contract.verifyProof(
                groupId2,
                bytes32Signal,
                fullProof.publicSignals.nullifierHash,
                fullProof.publicSignals.externalNullifier,
                roots.toHexString(),
                solidityProof
            )
            // const receipt = await transaction;
            // console.log("receipt: ,", receipt);

            await expect(transaction).to.emit(contract, "ProofVerified").withArgs(groupId2, bytes32Signal)
        })
    })
})
