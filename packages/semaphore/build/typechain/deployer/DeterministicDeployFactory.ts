/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export interface DeterministicDeployFactoryInterface extends utils.Interface {
  functions: {
    "deploy(bytes,uint256)": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "deploy"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "deploy",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(functionFragment: "deploy", data: BytesLike): Result;

  events: {
    "Deploy(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Deploy"): EventFragment;
}

export interface DeployEventObject {
  addr: string;
}
export type DeployEvent = TypedEvent<[string], DeployEventObject>;

export type DeployEventFilter = TypedEventFilter<DeployEvent>;

export interface DeterministicDeployFactory extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: DeterministicDeployFactoryInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    deploy(
      bytecode: PromiseOrValue<BytesLike>,
      _salt: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  deploy(
    bytecode: PromiseOrValue<BytesLike>,
    _salt: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    deploy(
      bytecode: PromiseOrValue<BytesLike>,
      _salt: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "Deploy(address)"(addr?: null): DeployEventFilter;
    Deploy(addr?: null): DeployEventFilter;
  };

  estimateGas: {
    deploy(
      bytecode: PromiseOrValue<BytesLike>,
      _salt: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    deploy(
      bytecode: PromiseOrValue<BytesLike>,
      _salt: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
