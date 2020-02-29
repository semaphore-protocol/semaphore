require('module-alias/register')
jest.setTimeout(90000)

const MiMC = require('@semaphore-contracts/compiled/MiMC.json')
const IncrementalMerkleTreeClient = require('@semaphore-contracts/compiled/IncrementalMerkleTreeClient.json')
import * as etherlime from 'etherlime-lib'
import { config } from 'semaphore-config'
import * as ethers from 'ethers'
import { storage, hashers, tree } from 'semaphore-merkle-tree'
const mimcSpongeHasher = new hashers.MimcSpongeHasher()

const account = ethers.Wallet.fromMnemonic(config.chain.mnemonic, `m/44'/60'/0'/0/0`)
let deployer
let mtContract
let mimcContract
import {
    genIdentity,
    genIdentityCommitment,
    setupTree,
} from 'libsemaphore'

const LEVELS = 20
let tree

describe('IncrementalMerkleTree functions should match the semaphore-merkle-tree implementation', () => {
    beforeAll(async () => {
        tree = setupTree(LEVELS)

        deployer = new etherlime.JSONRPCPrivateKeyDeployer(
            account.privateKey,
            config.get('chain.url'),
            {
                gasLimit: 8800000,
                chainId: config.get('chain.chainId'),
            },
        )

        console.log('Deploying MiMC')
        mimcContract = await deployer.deploy(MiMC, {})

        const libraries = {
            MiMC: mimcContract.contractAddress,
        }

        console.log('Deploying IncrementalMerkleTreeClient')
        mtContract = await deployer.deploy(IncrementalMerkleTreeClient, libraries)
    })

    test('hashLeftRight', async () => {
        const left = genIdentityCommitment(genIdentity()).toString()
        const right = genIdentityCommitment(genIdentity()).toString()
        const hash = await mtContract.hashLeftRight(left, right)
        const hash2 = mimcSpongeHasher.hash(0, left, right)
        expect(hash.toString()).toEqual(hash2)
    })

    test('initMerkleTree (via initMerkleTreeAsClient)', async () => {
        const tx = await mtContract.initMerkleTreeAsClient(
            LEVELS,
            ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.toUtf8Bytes('Semaphore')]),
        )
        const receipt = await tx.wait()

        console.log('Gas used by initMerkleTreeAsClient:', receipt.gasUsed.toString())
        const root = await mtContract.getTreeRoot()
        const root2 = await tree.root()
        expect(root.toString()).toEqual(root2)
    })

    test('insertLeaf (via insertLeafAsClient)', async () => {
        const leaf = genIdentityCommitment(genIdentity()).toString()
        const tx = await mtContract.insertLeafAsClient(leaf)
        const receipt = await tx.wait()

        console.log('Gas used by insertLeaf:', receipt.gasUsed.toString())
        tree.update(0, leaf)

        const root = await mtContract.getTreeRoot()
        const root2 = await tree.root()
        expect(root.toString()).toEqual(root2)
    })
})
