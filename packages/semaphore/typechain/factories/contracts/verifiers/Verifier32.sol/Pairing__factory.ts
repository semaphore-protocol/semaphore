/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  Pairing,
  PairingInterface,
} from "../../../../contracts/verifiers/Verifier32.sol/Pairing";

const _abi = [
  {
    inputs: [],
    name: "InvalidProof",
    type: "error",
  },
];

const _bytecode =
  "0x60566050600b82828239805160001a6073146043577f4e487b7100000000000000000000000000000000000000000000000000000000600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea264697066735822122088c75977b0b245cfc9c147b0e85cd5432f727a2d2e18df3f5ffef9212c93d6b164736f6c63430008040033";

type PairingConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PairingConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Pairing__factory extends ContractFactory {
  constructor(...args: PairingConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Pairing> {
    return super.deploy(overrides || {}) as Promise<Pairing>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Pairing {
    return super.attach(address) as Pairing;
  }
  override connect(signer: Signer): Pairing__factory {
    return super.connect(signer) as Pairing__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PairingInterface {
    return new utils.Interface(_abi) as PairingInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Pairing {
    return new Contract(address, _abi, signerOrProvider) as Pairing;
  }
}
