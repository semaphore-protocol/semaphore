import { BigNumber, BigNumberish, ContractTransaction, ethers, Signer } from 'ethers';
import {
  Verifier20_2__factory,
  Verifier20_7__factory,
  SemaphoreVerifier__factory,
  SemaphoreVerifier as SemaphoreVerifierContract,
} from '../typechain';

export class Verifier {
    signer: Signer
    contract: SemaphoreVerifierContract

    private constructor(contract: SemaphoreVerifierContract, signer: Signer) {
      this.signer = signer;
      this.contract = contract;
    }

// Deploys a Verifier contract and all auxiliary verifiers used by this verifier
    public static async createVerifier(signer: ethers.Signer) {
        const v2Factory = new Verifier20_2__factory(signer);
        const v2 = await v2Factory.deploy();
        await v2.deployed();

        const v7Factory = new Verifier20_7__factory(signer);
        const v7 = await v7Factory.deploy();
        await v7.deployed();

        const factory = new SemaphoreVerifier__factory(signer);
        const verifier = await factory.deploy(v2.address, v7.address);
        await verifier.deployed();
        const createdVerifier = new Verifier(verifier, signer);
        return createdVerifier;
    }
}

export default Verifier;
