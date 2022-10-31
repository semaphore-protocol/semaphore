import { Identity } from "@webb-tools/semaphore-identity"
import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import { randomBytes } from "@ethersproject/random"
import { sha256 as _sha256 } from "@ethersproject/sha2"
import { toUtf8Bytes } from "@ethersproject/strings"
import ganache from "ganache"
import Web3 from "web3"

export type VerifierContractInfo = {
  name: string
  address: string
  depth: string
  circuitLength: string
}
export function toFixedHex(number: BigNumberish, length = 32): string {
  return "0x".concat(
    (number instanceof Buffer
      ? number.toString("hex")
      : BigNumber.from(number).toHexString().slice(2)
    ).padStart(length * 2, "0")
  )
}

export function createRootsBytesWeb3(
  rootArray: string[] | BigNumberish[]
): string {
  const web3 = new Web3()
  return web3.eth.abi.encodeParameters(["bytes32[]"], [rootArray]).toString()
}

export function createRootsBytes(rootArray: string[] | BigNumberish[]): string {
  let rootsBytes = "0x"
  for (let i = 0; i < rootArray.length; i += 1) {
    rootsBytes += toFixedHex(rootArray[i], 32).substr(2)
  }
  return rootsBytes // root byte string (32 * array.length bytes)
}

export function createIdentities(n: number): {
  identities: Identity[]
  members: bigint[]
} {
  const identityCommitments: bigint[] = []
  const identities: Identity[] = []

  for (let i = 0; i < n; i += 1) {
    const identity = new Identity()
    const identityCommitment = identity.commitment

    identities.push(identity)
    identityCommitments.push(identityCommitment)
  }

  return { identities, members: identityCommitments }
}

// eslint-disable-next-line import/prefer-default-export
export function createIdentityCommitments(n: number): bigint[] {
  const identityCommitments: bigint[] = []

  for (let i = 0; i < n; i += 1) {
    const { commitment } = new Identity(i.toString())

    identityCommitments.push(commitment)
  }

  return identityCommitments
}
/**
 * Returns an hexadecimal sha256 hash of the message passed as parameter.
 * @param message The string to hash.
 * @returns The hexadecimal hash of the message.
 */
export function sha256(message: string): string {
  const hash = _sha256(toUtf8Bytes(message))

  return hash
}

/**
 * Generates a random big number.
 * @param numberOfBytes The number of bytes of the number.
 * @returns The generated random number.
 */
export function genRandomNumber(numberOfBytes = 31): bigint {
  return BigNumber.from(randomBytes(numberOfBytes)).toBigInt()
}

/**
 * Checks if a string is a JSON.
 * @param jsonString The JSON string.
 * @returns True or false.
 */
export function isJsonArray(jsonString: string) {
  try {
    return Array.isArray(JSON.parse(jsonString))
  } catch (error) {
    return false
  }
}

export type GanacheAccounts = {
  balance: string
  secretKey: string
}

export async function startGanacheServer(
  port: number,
  networkId: number,
  populatedAccounts: GanacheAccounts[],
  options: any = {}
) {
  const ganacheServer = ganache.server({
    accounts: populatedAccounts,
    chainId: networkId,
    network_id: networkId,
    quiet: true,
    ...options
  })

  await ganacheServer.listen(port)
  console.info(`Ganache Started on http://127.0.0.1:${port} ..`)

  return ganacheServer
}
