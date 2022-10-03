import { keccak256 } from "@ethersproject/solidity"
import { formatBytes32String } from "@ethersproject/strings"

/**
 * Hashes a signal string with Keccak256.
 * @param signal The Semaphore signal.
 * @returns The signal hash.
 */
export default function genSignalHash(signal: string): bigint {
  return (
    BigInt(keccak256(["bytes32"], [formatBytes32String(signal)])) >> BigInt(8)
  )
}
