import { ethers } from "ethers"

export const TreeZeroNode = BigInt(ethers.utils.solidityKeccak256(["bytes"], [ethers.utils.toUtf8Bytes("Semaphore")]))
