require('module-alias/register')
jest.setTimeout(90000)

const MiMC = require('@semaphore-contracts/compiled/MiMC.json')
const Semaphore = require('@semaphore-contracts/compiled/Semaphore.json')
const SemaphoreClient = require('@semaphore-contracts/compiled/SemaphoreClient.json')
const hasEvent = require('etherlime/cli-commands/etherlime-test/events.js').hasEvent

import {
    SnarkBigInt,
    genIdentity,
    genIdentityCommitment,
    genExternalNullifier,
    genWitness,
    genCircuit,
    genProof,
    genPublicSignals,
    verifyProof,
    SnarkProvingKey,
    SnarkVerifyingKey,
    parseVerifyingKeyJson,
    formatForVerifierContract,
} from 'libsemaphore'
import * as etherlime from 'etherlime-lib'
import { config } from 'semaphore-config'
import * as path from 'path'
import * as fs from 'fs'
import * as ethers from 'ethers'

const NUM_LEVELS = 20
const FIRST_EXTERNAL_NULLIFIER = 0
const SIGNAL = 'signal0'

const genTestAccounts = (num: number, mnemonic: string) => {
    let accounts: ethers.Wallet[] = []

    for (let i=0; i<num; i++) {
        const p = `m/44'/60'/${i}'/0/0`
        const wallet = ethers.Wallet.fromMnemonic(mnemonic, p)
        accounts.push(wallet)
    }

    return accounts
}

const accounts = genTestAccounts(2, config.chain.mnemonic)
let semaphoreContract
let semaphoreClientContract
let mimcContract

// hex representations of all inserted identity commitments
let insertedIdentityCommitments: string[] = []
const activeEn = genExternalNullifier(Date.now().toString())
const inactiveEn = genExternalNullifier(Date.now().toString())
const invalidEn = BigInt(Math.pow(2, 232)).toString()

let deployer

describe('Semaphore', () => {
    beforeAll(async () => {
        deployer = new etherlime.JSONRPCPrivateKeyDeployer(
            accounts[0].privateKey,
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

        console.log('Deploying Semaphore')
        semaphoreContract = await deployer.deploy(
            Semaphore,
            libraries,
            NUM_LEVELS,
            FIRST_EXTERNAL_NULLIFIER,
        )

        console.log('Deploying Semaphore Client')
        semaphoreClientContract = await deployer.deploy(
            SemaphoreClient,
            {},
            semaphoreContract.contractAddress,
        )

        console.log('Transferring ownership of the Semaphore contract to the Semaphore Client')
        const tx = await semaphoreContract.transferOwnership(
            semaphoreClientContract.contractAddress,
        )

        await tx.wait()
    })

    test('insert an identity commitment', async () => {
        const identity = genIdentity()
        const identityCommitment: SnarkBigInt = genIdentityCommitment(identity)

        const tx = await semaphoreClientContract.insertIdentityAsClient(
            identityCommitment.toString()
        )
        const receipt = await tx.wait()
        expect(receipt.status).toEqual(1)

        console.log('Gas used by insertIdentityAsClient():', receipt.gasUsed.toString())

        insertedIdentityCommitments.push('0x' + identityCommitment.toString(16))
        expect(hasEvent(receipt, semaphoreContract, 'LeafInsertion')).toBeTruthy()
    })

    describe('signal broadcasts', () => {
        // Load circuit, proving key, and verifying key
        const circuitPath = path.join(__dirname, '../../../circuits/build/circuit.json')
        const provingKeyPath = path.join(__dirname, '../../../circuits/build/proving_key.bin')
        const verifyingKeyPath = path.join(__dirname, '../../../circuits/build/verification_key.json')

        const cirDef = JSON.parse(fs.readFileSync(circuitPath).toString())
        const provingKey: SnarkProvingKey = fs.readFileSync(provingKeyPath)
        const verifyingKey: SnarkVerifyingKey = parseVerifyingKeyJson(fs.readFileSync(verifyingKeyPath).toString())
        const circuit = genCircuit(cirDef)
        let identity
        let identityCommitment
        let proof
        let publicSignals
        let params

        beforeAll(async () => {
            identity = genIdentity()
            identityCommitment = genIdentityCommitment(identity)

            await (await semaphoreClientContract.insertIdentityAsClient(identityCommitment.toString())).wait()

            const leaves = await semaphoreClientContract.getIdentityCommitments()

            const result = await genWitness(
                SIGNAL,
                circuit,
                identity,
                leaves,
                NUM_LEVELS,
                FIRST_EXTERNAL_NULLIFIER,
            )

            proof = await genProof(result.witness, provingKey)
            publicSignals = genPublicSignals(result.witness, circuit)
            params = formatForVerifierContract(proof, publicSignals)
        })

        test('the proof should be valid', async () => {
            expect.assertions(1)
            const isValid = verifyProof(verifyingKey, proof, publicSignals)
            expect(isValid).toBeTruthy()
        })

        test('the pre-broadcast check should pass', async () => {
            expect.assertions(1)

            const check = await semaphoreContract.preBroadcastCheck(
                ethers.utils.toUtf8Bytes(SIGNAL),
                params.a,
                params.b,
                params.c,
                params.input[0],
                params.input[1],
                params.input[2],
                FIRST_EXTERNAL_NULLIFIER,
            )
            expect(check).toBeTruthy()
        })

        test('broadcastSignal with an input element above the scalar field should fail', async () => {
            expect.assertions(1)
            const size = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617')
            const oversizedInput = (BigInt(params.input[1]) + size).toString()
            try {
                await semaphoreClientContract.broadcastSignal(
                    ethers.utils.toUtf8Bytes(SIGNAL),
                    params.a,
                    params.b,
                    params.c,
                    params.input[0],
                    oversizedInput,
                    FIRST_EXTERNAL_NULLIFIER,
                )
            } catch (e) {
                expect(e.message.endsWith('verifier-gte-snark-scalar-field')).toBeTruthy()
            }
        })

        test('broadcastSignal to active external nullifier with an account with the right permissions should work', async () => {
            expect.assertions(4)
            const tx = await semaphoreClientContract.broadcastSignal(
                ethers.utils.toUtf8Bytes(SIGNAL),
                params.a,
                params.b,
                params.c,
                params.input[0],
                params.input[1],
                params.input[3],
                { gasLimit: 1000000 },
            )
            const receipt = await tx.wait()
            expect(receipt.status).toEqual(1)
            console.log('Gas used by broadcastSignal():', receipt.gasUsed.toString())

            const index = (await semaphoreClientContract.nextSignalIndex()) - 1
            const signal = await semaphoreClientContract.signalIndexToSignal(index.toString())

            expect(ethers.utils.toUtf8String(signal)).toEqual(SIGNAL)

            expect(hasEvent(receipt, semaphoreContract, 'SignalBroadcast')).toBeTruthy()
            expect(hasEvent(receipt, semaphoreClientContract, 'SignalBroadcastByClient')).toBeTruthy()
        })
    })
})
