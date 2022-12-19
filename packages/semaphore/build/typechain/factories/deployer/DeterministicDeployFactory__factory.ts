/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  DeterministicDeployFactory,
  DeterministicDeployFactoryInterface,
} from "../../deployer/DeterministicDeployFactory";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "addr",
        type: "address",
      },
    ],
    name: "Deploy",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "bytecode",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "_salt",
        type: "uint256",
      },
    ],
    name: "deploy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5061031f806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80639c4ae2d014610030575b600080fd5b61004a60048036038101906100459190610126565b61004c565b005b6000818351602085016000f59050803b61006557600080fd5b7f55ea6c6b31543d8e2ec6a72f71a79c0f4b72ed0d4757172b043d8f4f4cd84848816040516100949190610191565b60405180910390a1505050565b60006100b46100af846101d1565b6101ac565b9050828152602081018484840111156100d0576100cf6102b2565b5b6100db84828561023e565b509392505050565b600082601f8301126100f8576100f76102ad565b5b81356101088482602086016100a1565b91505092915050565b600081359050610120816102d2565b92915050565b6000806040838503121561013d5761013c6102bc565b5b600083013567ffffffffffffffff81111561015b5761015a6102b7565b5b610167858286016100e3565b925050602061017885828601610111565b9150509250929050565b61018b81610202565b82525050565b60006020820190506101a66000830184610182565b92915050565b60006101b66101c7565b90506101c2828261024d565b919050565b6000604051905090565b600067ffffffffffffffff8211156101ec576101eb61027e565b5b6101f5826102c1565b9050602081019050919050565b600061020d82610214565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b82818337600083830152505050565b610256826102c1565b810181811067ffffffffffffffff821117156102755761027461027e565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b6102db81610234565b81146102e657600080fd5b5056fea2646970667358221220f525a46ed6a184d1f14c0960b870b2ad97837c559add63bd09b714316de3574764736f6c63430008060033";

type DeterministicDeployFactoryConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DeterministicDeployFactoryConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class DeterministicDeployFactory__factory extends ContractFactory {
  constructor(...args: DeterministicDeployFactoryConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<DeterministicDeployFactory> {
    return super.deploy(overrides || {}) as Promise<DeterministicDeployFactory>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): DeterministicDeployFactory {
    return super.attach(address) as DeterministicDeployFactory;
  }
  override connect(signer: Signer): DeterministicDeployFactory__factory {
    return super.connect(signer) as DeterministicDeployFactory__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DeterministicDeployFactoryInterface {
    return new utils.Interface(_abi) as DeterministicDeployFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DeterministicDeployFactory {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as DeterministicDeployFactory;
  }
}
