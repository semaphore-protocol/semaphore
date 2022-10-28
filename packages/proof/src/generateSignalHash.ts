import { isHexString } from "@ethersproject/bytes"
import { keccak256 } from "@ethersproject/solidity"
import { formatBytes32String } from "@ethersproject/strings"

/**
 * Hashes a signal string with Keccak256.
 * @param signal The Semaphore signal.
 * @returns The signal hash.
 */
export default function genSignalHash(signal: string): bigint {
  if (!isHexString(signal, 32)) {
    signal = formatBytes32String(signal)
  }

  return BigInt(keccak256(["bytes32"], [signal])) >> BigInt(8)
}
