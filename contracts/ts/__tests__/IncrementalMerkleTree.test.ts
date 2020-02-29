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

const ZERO_VALUE = 
    ethers.utils.solidityKeccak256(
        ['bytes'],
        [ethers.utils.toUtf8Bytes('Semaphore')]
    )

describe('IncrementalMerkleTree functions should match the semaphore-merkle-tree implementation', () => {
    let libraries

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

        libraries = {
            MiMC: mimcContract.contractAddress,
        }
    })

    test('deployment', async () => {
        console.log('Deploying IncrementalMerkleTreeClient')

        mtContract = await deployer.deploy(
            IncrementalMerkleTreeClient,
            libraries,
            LEVELS,
            ZERO_VALUE,
        )

        const root = await mtContract.root()
        const root2 = await tree.root()
        expect(root.toString()).toEqual(root2)
    })

    test('deployment should fail if the specified number of levels is 0', async () => {
        try {
            await deployer.deploy(
                IncrementalMerkleTreeClient,
                libraries,
                0,
                ZERO_VALUE,
            )
        } catch (e) {
            expect(e.message.endsWith('IncrementalMerkleTree: _treeLevels must be between 0 and 33')).toBeTruthy()
        }
    })

    test('initMerkleTree should fail if the specified number of levels exceeds 32', async () => {
        try {
            await deployer.deploy(
                IncrementalMerkleTreeClient,
                libraries,
                33,
                ZERO_VALUE,
            )
        } catch (e) {
            expect(e.message.endsWith('IncrementalMerkleTree: _treeLevels must be between 0 and 33')).toBeTruthy()
        }
    })

    test('insertLeaf should fail if the leaf > the snark scalar field', async () => {
        const leaf = '21888242871839275222246405745257275088548364400416034343698204186575808495618'
        try {
            await mtContract.insertLeafAsClient(leaf)
        } catch (e) {
            expect(e.message.endsWith('IncrementalMerkleTree: insertLeaf argument must be < SNARK_SCALAR_FIELD'))
        }
    })

    test('insertLeaf (via insertLeafAsClient)', async () => {
        const leaf = genIdentityCommitment(genIdentity()).toString()
        const tx = await mtContract.insertLeafAsClient(leaf)
        const receipt = await tx.wait()

        console.log('Gas used by insertLeaf:', receipt.gasUsed.toString())
        await tree.update(0, leaf)

        const root = await mtContract.root()
        const root2 = await tree.root()
        expect(root.toString()).toEqual(root2)
    })

    test('inserting a few leaves should work', async () => {
        for (let i = 1; i < 9; i++) {
            const leaf = genIdentityCommitment(genIdentity()).toString()
            const tx = await mtContract.insertLeafAsClient(leaf)
            const receipt = await tx.wait()

            await tree.update(i, leaf)

            const root = await mtContract.root()
            const root2 = await tree.root()
            expect(root.toString()).toEqual(root2)
        }
    })
})
