/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  Verifier26,
  Verifier26Interface,
} from "../../../../contracts/verifiers/Verifier26.sol/Verifier26";

const _abi = [
  {
    inputs: [],
    name: "InvalidProof",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256[2]",
        name: "a",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[2][2]",
        name: "b",
        type: "uint256[2][2]",
      },
      {
        internalType: "uint256[2]",
        name: "c",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[4]",
        name: "input",
        type: "uint256[4]",
      },
    ],
    name: "verifyProof",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5061210b806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80635fe8c13b14610030575b600080fd5b61004a60048036038101906100459190611deb565b61004c565b005b610054611af6565b604051806040016040528086600060028110610099577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201518152602001866001600281106100dd577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201518152508160000181905250604051806040016040528060405180604001604052808760006002811061013d577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002015160006002811061017b577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201518152602001876000600281106101bf577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201516001600281106101fd577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151815250815260200160405180604001604052808760016002811061024f577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002015160006002811061028d577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201518152602001876001600281106102d1577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002015160016002811061030f577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201518152508152508160200181905250604051806040016040528084600060028110610367577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201518152602001846001600281106103ab577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151815250816040018190525060006103c5610a23565b9050806080015151600160046103db9190611ee7565b14610412576040517f09bde33900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60008160800151600081518110610452577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001015190506104f2816104ed84608001516001815181106104a1577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010151876000600481106104e3577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151611073565b611201565b905061058a816105858460800151600281518110610539577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200260200101518760016004811061057b577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151611073565b611201565b90506106228161061d84608001516003815181106105d1577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001015187600260048110610613577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151611073565b611201565b90506106ba816106b58460800151600481518110610669577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010151876003600481106106ab577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151611073565b611201565b90506000600467ffffffffffffffff8111156106ff577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b60405190808252806020026020018201604052801561073857816020015b610725611b29565b81526020019060019003908161071d5790505b5090506000600467ffffffffffffffff81111561077e577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040519080825280602002602001820160405280156107b757816020015b6107a4611b43565b81526020019060019003908161079c5790505b5090506107c78560000151611382565b82600081518110610801577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001018190525084602001518160008151811061084b577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010181905250836000015182600181518110610895577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200260200101819052508360200151816001815181106108df577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200260200101819052508282600281518110610925577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001018190525083604001518160028151811061096f577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200260200101819052508460400151826003815181106109b9577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010181905250836060015181600381518110610a03577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010181905250610a1882826114a3565b505050505050505050565b610a2b611b69565b60405180604001604052807f2d4d9aa7e302d9df41749d5507949d05dbea33fbb16c643b22f599a2be6df2e281526020017f14bedd503c37ceb061d8ec60209fe345ce89830a19230301f076caff004d19268152508160000181905250604051806040016040528060405180604001604052807f0967032fcbf776d1afc985f88877f182d38480a653f2decaa9794cbc3bf3060c81526020017f0e187847ad4c798374d0d6732bf501847dd68bc0e071241e0213bc7fc13db7ab815250815260200160405180604001604052807f304cfbd1e08a704a99f5e847d93f8c3caafddec46b7a0d379da69a4d112346a781526020017f1739c1b1a457a8c7313123d24d2f9192f896b7c63eea05a9d57f06547ad0cec88152508152508160200181905250604051806040016040528060405180604001604052807f198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c281526020017f1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed815250815260200160405180604001604052807f090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b81526020017f12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa8152508152508160400181905250604051806040016040528060405180604001604052807f03cf7157aba9c6be40a06864fa2c0e06f7178133d9c3768ff3982814946b0f7d81526020017f08e4f2655701b165858a2fc04d15297c282aec942c4a521cbe687772a2a775ad815250815260200160405180604001604052807f10eab11af7f34e5cdb73b010a98d7f18c7410eec5d8eb1b4526359f5ab246b2d81526020017f2727dfb72de41bcd49e47c8940bfe75b600bd39467763baecc6f8087130866d98152508152508160600181905250600567ffffffffffffffff811115610d18577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b604051908082528060200260200182016040528015610d5157816020015b610d3e611b29565b815260200190600190039081610d365790505b50816080018190525060405180604001604052807f096440bcf7534fd07ca2a941ad8fb743c49c0a5684920ee13e992f3ab8342af981526020017f200eecd036971149677fdd19a7f2dc2e2a33a460211994adce7f967da2920b9d8152508160800151600081518110610ded577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001018190525060405180604001604052807f2ee692deea7671684657a2ee16ffb165dd3bfd3cb8af86620b7d0feeaad6624881526020017f0328fec7c2ec04f0a7375c917f31ee23af341252c71051e8cd9a80ce9080121b8152508160800151600181518110610e8b577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001018190525060405180604001604052807f1b8f18e1106fa4188030c6c00b7a9b76bc309ffadb11f47d5ff38bd616f06e6081526020017f09adb161ecc2264110216d13cd5dad70d58dcc398f9431844f9faef1baabeece8152508160800151600281518110610f29577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001018190525060405180604001604052807f18f1f7aa58cecca54d15b583367484da5dfc809734621c5699e4f812131b285981526020017f2f73d9c341a4bb3a5737672b5e6191848505c5ba127370425286901bf628b4388152508160800151600381518110610fc7577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001018190525060405180604001604052807f2b869cfd2665da2a22c29622642595edd5bcded7e84209a1a0cd0a07c2d0c74381526020017f09d3dfe76c7b340c97705915c61f06591d27c5e3ec9e9a91582188298aab25988152508160800151600481518110611065577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001018190525090565b61107b611b29565b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000182106110d4576040517f09bde33900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6110dc611bb0565b83600001518160006003811061111b577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002018181525050836020015181600160038110611163577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201818152505082816002600381106111a7577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002018181525050600060608360808460076107d05a03fa9050806111f9576040517f09bde33900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b505092915050565b611209611b29565b611211611bd2565b836000015181600060048110611250577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002018181525050836020015181600160048110611298577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020181815250508260000151816002600481106112e0577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002018181525050826020015181600360048110611328577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002018181525050600060608360c08460066107d05a03fa90508061137a576040517f09bde33900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b505092915050565b61138a611b29565b600082600001511480156113a2575060008260200151145b156113c5576040518060400160405280600081526020016000815250905061149e565b7f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47826000015110158061141c57507f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47826020015110155b15611453576040517f09bde33900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60405180604001604052808360000151815260200183602001517f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd476114989190611f97565b81525090505b919050565b80518251146114de576040517f09bde33900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60008251905060006006826114f39190611f3d565b905060008167ffffffffffffffff811115611537577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040519080825280602002602001820160405280156115655781602001602082028036833780820191505090505b50905060005b83811015611a4a578581815181106115ac577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010151600001518260006006846115c89190611f3d565b6115d29190611ee7565b81518110611609577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200260200101818152505085818151811061164e577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200260200101516020015182600160068461166a9190611f3d565b6116749190611ee7565b815181106116ab577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010181815250508481815181106116f0577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001015160000151600060028110611735577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002015182600260068461174a9190611f3d565b6117549190611ee7565b8151811061178b577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010181815250508481815181106117d0577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001015160000151600160028110611815577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002015182600360068461182a9190611f3d565b6118349190611ee7565b8151811061186b577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010181815250508481815181106118b0577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010151602001516000600281106118f5577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002015182600460068461190a9190611f3d565b6119149190611ee7565b8151811061194b577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001018181525050848181518110611990577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010151602001516001600281106119d5577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201518260056006846119ea9190611f3d565b6119f49190611ee7565b81518110611a2b577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010181815250508080611a4290612006565b91505061156b565b50611a53611bf4565b6000602082602086026020860160086107d05a03fa9050801580611ab65750600182600060018110611aae577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002015114155b15611aed576040517f09bde33900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b50505050505050565b6040518060600160405280611b09611b29565b8152602001611b16611b43565b8152602001611b23611b29565b81525090565b604051806040016040528060008152602001600081525090565b6040518060400160405280611b56611c16565b8152602001611b63611c16565b81525090565b6040518060a00160405280611b7c611b29565b8152602001611b89611b43565b8152602001611b96611b43565b8152602001611ba3611b43565b8152602001606081525090565b6040518060600160405280600390602082028036833780820191505090505090565b6040518060800160405280600490602082028036833780820191505090505090565b6040518060200160405280600190602082028036833780820191505090505090565b6040518060400160405280600290602082028036833780820191505090505090565b6000611c4b611c4684611e75565b611e50565b90508082856040860282011115611c6157600080fd5b60005b85811015611c915781611c778882611d88565b845260208401935060408301925050600181019050611c64565b5050509392505050565b6000611cae611ca984611e9b565b611e50565b90508082856020860282011115611cc457600080fd5b60005b85811015611cf45781611cda8882611dd6565b845260208401935060208301925050600181019050611cc7565b5050509392505050565b6000611d11611d0c84611ec1565b611e50565b90508082856020860282011115611d2757600080fd5b60005b85811015611d575781611d3d8882611dd6565b845260208401935060208301925050600181019050611d2a565b5050509392505050565b600082601f830112611d7257600080fd5b6002611d7f848285611c38565b91505092915050565b600082601f830112611d9957600080fd5b6002611da6848285611c9b565b91505092915050565b600082601f830112611dc057600080fd5b6004611dcd848285611cfe565b91505092915050565b600081359050611de5816120be565b92915050565b6000806000806101808587031215611e0257600080fd5b6000611e1087828801611d88565b9450506040611e2187828801611d61565b93505060c0611e3287828801611d88565b925050610100611e4487828801611daf565b91505092959194509250565b6000611e5a611e6b565b9050611e668282611fd5565b919050565b6000604051905090565b600067ffffffffffffffff821115611e9057611e8f61207e565b5b602082029050919050565b600067ffffffffffffffff821115611eb657611eb561207e565b5b602082029050919050565b600067ffffffffffffffff821115611edc57611edb61207e565b5b602082029050919050565b6000611ef282611fcb565b9150611efd83611fcb565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115611f3257611f3161204f565b5b828201905092915050565b6000611f4882611fcb565b9150611f5383611fcb565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615611f8c57611f8b61204f565b5b828202905092915050565b6000611fa282611fcb565b9150611fad83611fcb565b925082821015611fc057611fbf61204f565b5b828203905092915050565b6000819050919050565b611fde826120ad565b810181811067ffffffffffffffff82111715611ffd57611ffc61207e565b5b80604052505050565b600061201182611fcb565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8214156120445761204361204f565b5b600182019050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b6120c781611fcb565b81146120d257600080fd5b5056fea2646970667358221220627a96b4ccb90320a022202f4455676d729d41b52090615041307ff998bb1a9d64736f6c63430008040033";

type Verifier26ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: Verifier26ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Verifier26__factory extends ContractFactory {
  constructor(...args: Verifier26ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Verifier26> {
    return super.deploy(overrides || {}) as Promise<Verifier26>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Verifier26 {
    return super.attach(address) as Verifier26;
  }
  override connect(signer: Signer): Verifier26__factory {
    return super.connect(signer) as Verifier26__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): Verifier26Interface {
    return new utils.Interface(_abi) as Verifier26Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Verifier26 {
    return new Contract(address, _abi, signerOrProvider) as Verifier26;
  }
}
