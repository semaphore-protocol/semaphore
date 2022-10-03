/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  SemaphoreCore,
  SemaphoreCoreInterface,
} from "../../../contracts/base/SemaphoreCore";

const _abi = [
  {
    inputs: [],
    name: "Semaphore__YouAreUsingTheSameNillifierTwice",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "nullifierHash",
        type: "uint256",
      },
    ],
    name: "NullifierHashAdded",
    type: "event",
  },
];

const _bytecode =
  "0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220baa73703afcc11a0a57e2f526eb14724563d847765193ff445b91051a960a69064736f6c63430008050033";

type SemaphoreCoreConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: SemaphoreCoreConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class SemaphoreCore__factory extends ContractFactory {
  constructor(...args: SemaphoreCoreConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<SemaphoreCore> {
    return super.deploy(overrides || {}) as Promise<SemaphoreCore>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): SemaphoreCore {
    return super.attach(address) as SemaphoreCore;
  }
  override connect(signer: Signer): SemaphoreCore__factory {
    return super.connect(signer) as SemaphoreCore__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SemaphoreCoreInterface {
    return new utils.Interface(_abi) as SemaphoreCoreInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SemaphoreCore {
    return new Contract(address, _abi, signerOrProvider) as SemaphoreCore;
  }
}
