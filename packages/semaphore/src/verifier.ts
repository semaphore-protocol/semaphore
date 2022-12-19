import { ethers, Signer } from "ethers"
import {
  Verifier20_2__factory,
  Verifier20_8__factory,
  SemaphoreVerifier__factory,
  SemaphoreVerifier as SemaphoreVerifierContract
} from "../build/typechain"
import { Deployer } from "./deployer"

export class Verifier {
  signer: Signer
  contract: SemaphoreVerifierContract

  private constructor(contract: SemaphoreVerifierContract, signer: Signer) {
    this.signer = signer
    this.contract = contract
  }

  public static async create2Verifier(
    deployer: Deployer,
    saltHex: string,
    signer: ethers.Signer
  ): Promise<Verifier> {
    const { contract: v2 } = await deployer.deploy(
      Verifier20_2__factory,
      saltHex,
      signer
    )
    const { contract: v8 } = await deployer.deploy(
      Verifier20_8__factory,
      saltHex,
      signer
    )

    const argTypes = ["address", "address"]
    const args = [v2.address, v8.address]
    const { contract: verifier } = await deployer.deploy(
      SemaphoreVerifier__factory,
      saltHex,
      signer,
      undefined,
      argTypes,
      args
    )
    const createdVerifier = new Verifier(verifier, signer)
    return createdVerifier
  }
  // Deploys a Verifier contract and all auxiliary verifiers used by this verifier
  public static async createVerifier(signer: ethers.Signer) {
    const v2Factory = new Verifier20_2__factory(signer)
    const v2 = await v2Factory.deploy()
    await v2.deployed()

    const v7Factory = new Verifier20_8__factory(signer)
    const v7 = await v7Factory.deploy()
    await v7.deployed()

    const factory = new SemaphoreVerifier__factory(signer)
    const verifier = await factory.deploy(v2.address, v7.address)
    await verifier.deployed()
    const createdVerifier = new Verifier(verifier, signer)
    return createdVerifier
  }
}

export default Verifier
