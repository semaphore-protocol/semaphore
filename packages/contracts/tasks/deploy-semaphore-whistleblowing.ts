import { poseidon_gencontract as poseidonContract } from "circomlibjs"
import { Contract } from "ethers"
import { task, types } from "hardhat/config"
import { LinkableIncrementalBinaryTree__factory } from "../build/typechain"

// task("deploy:semaphore-whistleblowing", "Deploy a SemaphoreWhistleblowing contract")
//     .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
//     .addParam("verifiers", "Verifier contract address", undefined, types.json)
//     .setAction(async ({ logs, verifiers }, { ethers }): Promise<Contract> => {
//         const poseidonABI = poseidonContract.generateABI(2)
//         const poseidonBytecode = poseidonContract.createCode(2)
//
//     const [signer] = await ethers.getSigners()
//
//     const PoseidonLibFactory = new ethers.ContractFactory(
//       poseidonABI,
//       poseidonBytecode,
//       signer
//     )
//     const poseidonLib = await PoseidonLibFactory.deploy()
//
//     await poseidonLib.deployed()
//
//     if (logs) {
//       console.info(`Poseidon library has been deployed to: ${poseidonLib.address}`)
//     }
//
//     const LinkableIncrementalBinaryTreeLibFactory =
//       await ethers.getContractFactory("LinkableIncrementalBinaryTree", {})
//     const linkableIncrementalBinaryTreeLib =
//       await LinkableIncrementalBinaryTreeLibFactory.deploy()
//
//     await linkableIncrementalBinaryTreeLib.deployed()
//
//     if (logs) {
//       console.info(`LinkableIncrementalBinaryTree library has been deployed to: ${linkableIncrementalBinaryTreeLib.address}`)
//     }
//
//     const SemaphoreInputEncoderLibFactory = await ethers.getContractFactory(
//       "SemaphoreInputEncoder"
//     )
//     const semaphoreInputEncoderLib =
//       await SemaphoreInputEncoderLibFactory.deploy()
//
//     await semaphoreInputEncoderLib.deployed()
//
//     if (logs) {
//       console.info(`SemaphoreInputEncoder library has been deployed to: ${semaphoreInputEncoderLib.address}`)
//     }
//
//     const ContractFactory = await ethers.getContractFactory(
//       "SemaphoreWhistleblowing",
//       {
//         libraries: {
//           SemaphoreInputEncoder: semaphoreInputEncoderLib.address,
//           LinkableIncrementalBinaryTree:
//             linkableIncrementalBinaryTreeLib.address,
//           PoseidonT3: poseidonLib.address
//         }
//       }
//     )
//     const contract = await ContractFactory.deploy([20], verifiers)
//
//     await contract.deployed()
//     if (logs) {
//       console.info(`SemaphoreWhistleblowing contract has been deployed to: ${contract.address}`)
//     }
//
//     return contract
//   })
task(
  "deploy:semaphore-whistleblowing",
  "Deploy a SemaphoreWhistleblowing contract"
)
  .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
  .addParam<boolean>(
    "verifier",
    "Verifier contract address",
    undefined,
    types.string
  )
  .setAction(async ({ logs, verifier }, { ethers }): Promise<Contract> => {
    const poseidonABI = poseidonContract.generateABI(2)
    const poseidonBytecode = poseidonContract.createCode(2)

    const [signer] = await ethers.getSigners()

    const PoseidonLibFactory = new ethers.ContractFactory(
      poseidonABI,
      poseidonBytecode,
      signer
    )
    const poseidonLib = await PoseidonLibFactory.deploy()

    await poseidonLib.deployed()

    if (logs) {
      console.log(
        `Poseidon library has been deployed to: ${poseidonLib.address}`
      )
    }

    const LinkableIncrementalBinaryTreeLibFactory =
      new LinkableIncrementalBinaryTree__factory(
        {
          ["contracts/base/Poseidon.sol:PoseidonT3Lib"]: poseidonLib.address
        },
        signer
      )
    const linkableIncrementalBinaryTreeLib =
      await LinkableIncrementalBinaryTreeLibFactory.deploy()

    await linkableIncrementalBinaryTreeLib.deployed()

    if (logs) {
      console.log(
        `LinkableIncrementalBinaryTree library has been deployed to: ${linkableIncrementalBinaryTreeLib.address}`
      )
    }

    if (logs) {
      console.log(
        `LinkableIncrementalBinaryTree library has been deployed to: ${linkableIncrementalBinaryTreeLib.address}`
      )
    }

    const SemaphoreInputEncoderLibFactory = await ethers.getContractFactory(
      "SemaphoreInputEncoder"
    )
    const semaphoreInputEncoderLib =
      await SemaphoreInputEncoderLibFactory.deploy()

    await semaphoreInputEncoderLib.deployed()

    if (logs) {
      console.log(
        `SemaphoreInputEncoder library has been deployed to: ${semaphoreInputEncoderLib.address}`
      )
    }

    const ContractFactory = await ethers.getContractFactory(
      "SemaphoreWhistleblowing",
      {
        libraries: {
          SemaphoreInputEncoder: semaphoreInputEncoderLib.address,
          LinkableIncrementalBinaryTree:
            linkableIncrementalBinaryTreeLib.address,
          PoseidonT3Lib: poseidonLib.address
        }
      }
    )

    // TODO: Generalize this over depths
    const contract = await ContractFactory.deploy([
      {
        contractAddress: verifier,
        merkleTreeDepth: 20
      }
    ])

    await contract.deployed()

    if (logs) {
      console.log(
        `SemaphoreWhistleblowing contract has been deployed to: ${contract.address}`
      )
    }

    return contract
  })
