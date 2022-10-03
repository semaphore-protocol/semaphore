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
} from "../../common";

export interface ISemaphoreVotingInterface extends utils.Interface {
  functions: {
    "addVoter(uint256,uint256)": FunctionFragment;
    "castVote(bytes32,uint256,uint256,bytes,uint256[8])": FunctionFragment;
    "createPoll(uint256,uint8,address,uint8)": FunctionFragment;
    "endPoll(uint256,uint256)": FunctionFragment;
    "startPoll(uint256,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "addVoter"
      | "castVote"
      | "createPoll"
      | "endPoll"
      | "startPoll"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addVoter",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "castVote",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "createPoll",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "endPoll",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "startPoll",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(functionFragment: "addVoter", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "castVote", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "createPoll", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "endPoll", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "startPoll", data: BytesLike): Result;

  events: {
    "PollCreated(uint256,address)": EventFragment;
    "PollEnded(uint256,address,uint256)": EventFragment;
    "PollStarted(uint256,address,uint256)": EventFragment;
    "VoteAdded(uint256,bytes32)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "PollCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PollEnded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PollStarted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "VoteAdded"): EventFragment;
}

export interface PollCreatedEventObject {
  pollId: BigNumber;
  coordinator: string;
}
export type PollCreatedEvent = TypedEvent<
  [BigNumber, string],
  PollCreatedEventObject
>;

export type PollCreatedEventFilter = TypedEventFilter<PollCreatedEvent>;

export interface PollEndedEventObject {
  pollId: BigNumber;
  coordinator: string;
  decryptionKey: BigNumber;
}
export type PollEndedEvent = TypedEvent<
  [BigNumber, string, BigNumber],
  PollEndedEventObject
>;

export type PollEndedEventFilter = TypedEventFilter<PollEndedEvent>;

export interface PollStartedEventObject {
  pollId: BigNumber;
  coordinator: string;
  encryptionKey: BigNumber;
}
export type PollStartedEvent = TypedEvent<
  [BigNumber, string, BigNumber],
  PollStartedEventObject
>;

export type PollStartedEventFilter = TypedEventFilter<PollStartedEvent>;

export interface VoteAddedEventObject {
  pollId: BigNumber;
  vote: string;
}
export type VoteAddedEvent = TypedEvent<
  [BigNumber, string],
  VoteAddedEventObject
>;

export type VoteAddedEventFilter = TypedEventFilter<VoteAddedEvent>;

export interface ISemaphoreVoting extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ISemaphoreVotingInterface;

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
    addVoter(
      pollId: PromiseOrValue<BigNumberish>,
      identityCommitment: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    castVote(
      vote: PromiseOrValue<BytesLike>,
      nullifierHash: PromiseOrValue<BigNumberish>,
      pollId: PromiseOrValue<BigNumberish>,
      roots: PromiseOrValue<BytesLike>,
      proof: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    createPoll(
      pollId: PromiseOrValue<BigNumberish>,
      depth: PromiseOrValue<BigNumberish>,
      coordinator: PromiseOrValue<string>,
      maxEdges: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    endPoll(
      pollId: PromiseOrValue<BigNumberish>,
      decryptionKey: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    startPoll(
      pollId: PromiseOrValue<BigNumberish>,
      encryptionKey: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  addVoter(
    pollId: PromiseOrValue<BigNumberish>,
    identityCommitment: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  castVote(
    vote: PromiseOrValue<BytesLike>,
    nullifierHash: PromiseOrValue<BigNumberish>,
    pollId: PromiseOrValue<BigNumberish>,
    roots: PromiseOrValue<BytesLike>,
    proof: PromiseOrValue<BigNumberish>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  createPoll(
    pollId: PromiseOrValue<BigNumberish>,
    depth: PromiseOrValue<BigNumberish>,
    coordinator: PromiseOrValue<string>,
    maxEdges: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  endPoll(
    pollId: PromiseOrValue<BigNumberish>,
    decryptionKey: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  startPoll(
    pollId: PromiseOrValue<BigNumberish>,
    encryptionKey: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addVoter(
      pollId: PromiseOrValue<BigNumberish>,
      identityCommitment: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    castVote(
      vote: PromiseOrValue<BytesLike>,
      nullifierHash: PromiseOrValue<BigNumberish>,
      pollId: PromiseOrValue<BigNumberish>,
      roots: PromiseOrValue<BytesLike>,
      proof: PromiseOrValue<BigNumberish>[],
      overrides?: CallOverrides
    ): Promise<void>;

    createPoll(
      pollId: PromiseOrValue<BigNumberish>,
      depth: PromiseOrValue<BigNumberish>,
      coordinator: PromiseOrValue<string>,
      maxEdges: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    endPoll(
      pollId: PromiseOrValue<BigNumberish>,
      decryptionKey: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    startPoll(
      pollId: PromiseOrValue<BigNumberish>,
      encryptionKey: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "PollCreated(uint256,address)"(
      pollId?: null,
      coordinator?: PromiseOrValue<string> | null
    ): PollCreatedEventFilter;
    PollCreated(
      pollId?: null,
      coordinator?: PromiseOrValue<string> | null
    ): PollCreatedEventFilter;

    "PollEnded(uint256,address,uint256)"(
      pollId?: null,
      coordinator?: PromiseOrValue<string> | null,
      decryptionKey?: null
    ): PollEndedEventFilter;
    PollEnded(
      pollId?: null,
      coordinator?: PromiseOrValue<string> | null,
      decryptionKey?: null
    ): PollEndedEventFilter;

    "PollStarted(uint256,address,uint256)"(
      pollId?: null,
      coordinator?: PromiseOrValue<string> | null,
      encryptionKey?: null
    ): PollStartedEventFilter;
    PollStarted(
      pollId?: null,
      coordinator?: PromiseOrValue<string> | null,
      encryptionKey?: null
    ): PollStartedEventFilter;

    "VoteAdded(uint256,bytes32)"(
      pollId?: PromiseOrValue<BigNumberish> | null,
      vote?: null
    ): VoteAddedEventFilter;
    VoteAdded(
      pollId?: PromiseOrValue<BigNumberish> | null,
      vote?: null
    ): VoteAddedEventFilter;
  };

  estimateGas: {
    addVoter(
      pollId: PromiseOrValue<BigNumberish>,
      identityCommitment: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    castVote(
      vote: PromiseOrValue<BytesLike>,
      nullifierHash: PromiseOrValue<BigNumberish>,
      pollId: PromiseOrValue<BigNumberish>,
      roots: PromiseOrValue<BytesLike>,
      proof: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    createPoll(
      pollId: PromiseOrValue<BigNumberish>,
      depth: PromiseOrValue<BigNumberish>,
      coordinator: PromiseOrValue<string>,
      maxEdges: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    endPoll(
      pollId: PromiseOrValue<BigNumberish>,
      decryptionKey: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    startPoll(
      pollId: PromiseOrValue<BigNumberish>,
      encryptionKey: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addVoter(
      pollId: PromiseOrValue<BigNumberish>,
      identityCommitment: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    castVote(
      vote: PromiseOrValue<BytesLike>,
      nullifierHash: PromiseOrValue<BigNumberish>,
      pollId: PromiseOrValue<BigNumberish>,
      roots: PromiseOrValue<BytesLike>,
      proof: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    createPoll(
      pollId: PromiseOrValue<BigNumberish>,
      depth: PromiseOrValue<BigNumberish>,
      coordinator: PromiseOrValue<string>,
      maxEdges: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    endPoll(
      pollId: PromiseOrValue<BigNumberish>,
      decryptionKey: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    startPoll(
      pollId: PromiseOrValue<BigNumberish>,
      encryptionKey: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
