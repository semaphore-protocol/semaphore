/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  Verifier20_2,
  Verifier20_2Interface,
} from "../../../contracts/verifiers/Verifier20_2";

const _abi = [
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
        internalType: "uint256[6]",
        name: "input",
        type: "uint256[6]",
      },
    ],
    name: "verifyProof",
    outputs: [
      {
        internalType: "bool",
        name: "r",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50611cdf806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063f398789b14610030575b600080fd5b61004a6004803603810190610045919061164e565b610060565b6040516100579190611798565b60405180910390f35b600061006a611341565b60405180604001604052808760006002811061008957610088611b1e565b5b60200201518152602001876001600281106100a7576100a6611b1e565b5b6020020151815250816000018190525060405180604001604052806040518060400160405280886000600281106100e1576100e0611b1e565b5b60200201516000600281106100f9576100f8611b1e565b5b602002015181526020018860006002811061011757610116611b1e565b5b602002015160016002811061012f5761012e611b1e565b5b6020020151815250815260200160405180604001604052808860016002811061015b5761015a611b1e565b5b602002015160006002811061017357610172611b1e565b5b602002015181526020018860016002811061019157610190611b1e565b5b60200201516001600281106101a9576101a8611b1e565b5b602002015181525081525081602001819052506040518060400160405280856000600281106101db576101da611b1e565b5b60200201518152602001856001600281106101f9576101f8611b1e565b5b602002015181525081604001819052506000600667ffffffffffffffff81111561022657610225611b4d565b5b6040519080825280602002602001820160405280156102545781602001602082028036833780820191505090505b50905060005b60068110156102ad5784816006811061027657610275611b1e565b5b602002015182828151811061028e5761028d611b1e565b5b60200260200101818152505080806102a590611a46565b91505061025a565b5060006102ba82846102da565b14156102cb576001925050506102d2565b6000925050505b949350505050565b6000807f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000019050600061030a6104cd565b905080608001515160018651610320919061191b565b14610360576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610357906117b3565b60405180910390fd5b60006040518060400160405280600081526020016000815250905060005b865181101561044f578387828151811061039b5761039a611b1e565b5b6020026020010151106103e3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103da906117f3565b60405180910390fd5b61043a8261043585608001516001856103fc919061191b565b8151811061040d5761040c611b1e565b5b60200260200101518a858151811061042857610427611b1e565b5b6020026020010151610b28565b610c05565b9150808061044790611a46565b91505061037e565b5061047981836080015160008151811061046c5761046b611b1e565b5b6020026020010151610c05565b90506104af61048b8660000151610d08565b8660200151846000015185602001518587604001518b604001518960600151610dad565b6104bf57600193505050506104c7565b600093505050505b92915050565b6104d5611374565b60405180604001604052807f2d4d9aa7e302d9df41749d5507949d05dbea33fbb16c643b22f599a2be6df2e281526020017f14bedd503c37ceb061d8ec60209fe345ce89830a19230301f076caff004d19268152508160000181905250604051806040016040528060405180604001604052807f0967032fcbf776d1afc985f88877f182d38480a653f2decaa9794cbc3bf3060c81526020017f0e187847ad4c798374d0d6732bf501847dd68bc0e071241e0213bc7fc13db7ab815250815260200160405180604001604052807f304cfbd1e08a704a99f5e847d93f8c3caafddec46b7a0d379da69a4d112346a781526020017f1739c1b1a457a8c7313123d24d2f9192f896b7c63eea05a9d57f06547ad0cec88152508152508160200181905250604051806040016040528060405180604001604052807f198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c281526020017f1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed815250815260200160405180604001604052807f090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b81526020017f12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa8152508152508160400181905250604051806040016040528060405180604001604052807f244311ed340ba95c84c52b64a899209a9f941c4087fe607f3f32d05122ff976381526020017f0a762f9504d69662171e17f6cc0d9b55641c4fd17ccae8167534e22435a27008815250815260200160405180604001604052807f204c7af6efbc2a840118c34fa358eb9ed8a2e0955db63b7bfe0b652b63bd65d381526020017f2a8546f6d2972b6dcc643f51d12fd4236055fb2ef80ad496916337b8cfb121ee8152508152508160600181905250600767ffffffffffffffff81111561079c5761079b611b4d565b5b6040519080825280602002602001820160405280156107d557816020015b6107c26113bb565b8152602001906001900390816107ba5790505b50816080018190525060405180604001604052807f2bbc4ae8ba46b9d896c89adc6da2b38c5ee873ec4b134d3fafd46ef0980e9b2581526020017f161edc924ffe4645d80f3231b1ec9f43c7a4cc9dd07101419bf0a8161e85176b815250816080015160008151811061084b5761084a611b1e565b5b602002602001018190525060405180604001604052807f2a7151109b2036dabe9e3061bd384e0cda290ae3adce1004b37363c086bf530581526020017f016cc824d99e0fbf2245e287fb21ed9b802d2ab7ae8ac71712b306d080ac396181525081608001516001815181106108c3576108c2611b1e565b5b602002602001018190525060405180604001604052807f2f2e9451f2767d0a3a0d8ea4ca78f04f41586f83dd7bb854b3aa48fa061f7aaa81526020017f1615ca634c67cf33b3dd81d7631407b2b7b0440b0cab1274d5108d5f9e1ce959815250816080015160028151811061093b5761093a611b1e565b5b602002602001018190525060405180604001604052807f16b85e1d03566e72f5193e03d5496124d093f08d69e3f6a418735430dd73248081526020017f1ac3032bb1f7e402b71211fd49841c6e4d7694b724ebdda309fe2487b6a3e12381525081608001516003815181106109b3576109b2611b1e565b5b602002602001018190525060405180604001604052807f1ed31c9e4e461ccd664c793ac14e1d6eaaf77f135a4474318c8bf4876843b9f181526020017f29f47fdb8fcd6919106ba9b762da80b01790c73c4a46047693f19bcf42d962488152508160800151600481518110610a2b57610a2a611b1e565b5b602002602001018190525060405180604001604052807f14f7041425a3dd566364faeba089dee2a0d22afab74252b0201732446bff028581526020017f06511a25e057e38b54c1194761af4cf2dd014371b91a074851d116e087df9d328152508160800151600581518110610aa357610aa2611b1e565b5b602002602001018190525060405180604001604052807f200531805860f2d96f14907fa9a55008a10a639e9f3d5651f175210fc2bcec7f81526020017e30ed53912bf60d34f222a86581bb59bf39f625ac6efff122b33bd756b52d878152508160800151600681518110610b1a57610b19611b1e565b5b602002602001018190525090565b610b306113bb565b610b386113d5565b836000015181600060038110610b5157610b50611b1e565b5b602002018181525050836020015181600160038110610b7357610b72611b1e565b5b6020020181815250508281600260038110610b9157610b90611b1e565b5b602002018181525050600060608360808460076107d05a03fa90508060008114610bba57610bbc565bfe5b5080610bfd576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610bf4906117d3565b60405180910390fd5b505092915050565b610c0d6113bb565b610c156113f7565b836000015181600060048110610c2e57610c2d611b1e565b5b602002018181525050836020015181600160048110610c5057610c4f611b1e565b5b602002018181525050826000015181600260048110610c7257610c71611b1e565b5b602002018181525050826020015181600360048110610c9457610c93611b1e565b5b602002018181525050600060608360c08460066107d05a03fa90508060008114610cbd57610cbf565bfe5b5080610d00576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610cf790611833565b60405180910390fd5b505092915050565b610d106113bb565b60007f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47905060008360000151148015610d4d575060008360200151145b15610d71576040518060400160405280600081526020016000815250915050610da8565b604051806040016040528084600001518152602001828560200151610d969190611a8f565b83610da191906119cb565b8152509150505b919050565b600080600467ffffffffffffffff811115610dcb57610dca611b4d565b5b604051908082528060200260200182016040528015610e0457816020015b610df16113bb565b815260200190600190039081610de95790505b5090506000600467ffffffffffffffff811115610e2457610e23611b4d565b5b604051908082528060200260200182016040528015610e5d57816020015b610e4a611419565b815260200190600190039081610e425790505b5090508a82600081518110610e7557610e74611b1e565b5b60200260200101819052508882600181518110610e9557610e94611b1e565b5b60200260200101819052508682600281518110610eb557610eb4611b1e565b5b60200260200101819052508482600381518110610ed557610ed4611b1e565b5b60200260200101819052508981600081518110610ef557610ef4611b1e565b5b60200260200101819052508781600181518110610f1557610f14611b1e565b5b60200260200101819052508581600281518110610f3557610f34611b1e565b5b60200260200101819052508381600381518110610f5557610f54611b1e565b5b6020026020010181905250610f6a8282610f7a565b9250505098975050505050505050565b60008151835114610fc0576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610fb790611813565b60405180910390fd5b6000835190506000600682610fd59190611971565b905060008167ffffffffffffffff811115610ff357610ff2611b4d565b5b6040519080825280602002602001820160405280156110215781602001602082028036833780820191505090505b50905060005b838110156112a65786818151811061104257611041611b1e565b5b60200260200101516000015182600060068461105e9190611971565b611068919061191b565b8151811061107957611078611b1e565b5b60200260200101818152505086818151811061109857611097611b1e565b5b6020026020010151602001518260016006846110b49190611971565b6110be919061191b565b815181106110cf576110ce611b1e565b5b6020026020010181815250508581815181106110ee576110ed611b1e565b5b60200260200101516000015160006002811061110d5761110c611b1e565b5b60200201518260026006846111229190611971565b61112c919061191b565b8151811061113d5761113c611b1e565b5b60200260200101818152505085818151811061115c5761115b611b1e565b5b60200260200101516000015160016002811061117b5761117a611b1e565b5b60200201518260036006846111909190611971565b61119a919061191b565b815181106111ab576111aa611b1e565b5b6020026020010181815250508581815181106111ca576111c9611b1e565b5b6020026020010151602001516000600281106111e9576111e8611b1e565b5b60200201518260046006846111fe9190611971565b611208919061191b565b8151811061121957611218611b1e565b5b60200260200101818152505085818151811061123857611237611b1e565b5b60200260200101516020015160016002811061125757611256611b1e565b5b602002015182600560068461126c9190611971565b611276919061191b565b8151811061128757611286611b1e565b5b602002602001018181525050808061129e90611a46565b915050611027565b506112af61143f565b6000602082602086026020860160086107d05a03fa905080600081146112d4576112d6565bfe5b5080611317576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161130e90611853565b60405180910390fd5b60008260006001811061132d5761132c611b1e565b5b602002015114159550505050505092915050565b60405180606001604052806113546113bb565b8152602001611361611419565b815260200161136e6113bb565b81525090565b6040518060a001604052806113876113bb565b8152602001611394611419565b81526020016113a1611419565b81526020016113ae611419565b8152602001606081525090565b604051806040016040528060008152602001600081525090565b6040518060600160405280600390602082028036833780820191505090505090565b6040518060800160405280600490602082028036833780820191505090505090565b604051806040016040528061142c611461565b8152602001611439611461565b81525090565b6040518060200160405280600190602082028036833780820191505090505090565b6040518060400160405280600290602082028036833780820191505090505090565b600061149661149184611898565b611873565b905080828560408602820111156114b0576114af611b81565b5b60005b858110156114e057816114c688826115e3565b8452602084019350604083019250506001810190506114b3565b5050509392505050565b60006114fd6114f8846118be565b611873565b9050808285602086028201111561151757611516611b81565b5b60005b85811015611547578161152d8882611639565b84526020840193506020830192505060018101905061151a565b5050509392505050565b600061156461155f846118e4565b611873565b9050808285602086028201111561157e5761157d611b81565b5b60005b858110156115ae57816115948882611639565b845260208401935060208301925050600181019050611581565b5050509392505050565b600082601f8301126115cd576115cc611b7c565b5b60026115da848285611483565b91505092915050565b600082601f8301126115f8576115f7611b7c565b5b60026116058482856114ea565b91505092915050565b600082601f83011261162357611622611b7c565b5b6006611630848285611551565b91505092915050565b60008135905061164881611c92565b92915050565b6000806000806101c0858703121561166957611668611b86565b5b6000611677878288016115e3565b9450506040611688878288016115b8565b93505060c0611699878288016115e3565b9250506101006116ab8782880161160e565b91505092959194509250565b6116c0816119ff565b82525050565b60006116d360128361190a565b91506116de82611b9c565b602082019050919050565b60006116f660128361190a565b915061170182611bc5565b602082019050919050565b6000611719601f8361190a565b915061172482611bee565b602082019050919050565b600061173c60168361190a565b915061174782611c17565b602082019050919050565b600061175f60128361190a565b915061176a82611c40565b602082019050919050565b600061178260158361190a565b915061178d82611c69565b602082019050919050565b60006020820190506117ad60008301846116b7565b92915050565b600060208201905081810360008301526117cc816116c6565b9050919050565b600060208201905081810360008301526117ec816116e9565b9050919050565b6000602082019050818103600083015261180c8161170c565b9050919050565b6000602082019050818103600083015261182c8161172f565b9050919050565b6000602082019050818103600083015261184c81611752565b9050919050565b6000602082019050818103600083015261186c81611775565b9050919050565b600061187d61188e565b90506118898282611a15565b919050565b6000604051905090565b600067ffffffffffffffff8211156118b3576118b2611b4d565b5b602082029050919050565b600067ffffffffffffffff8211156118d9576118d8611b4d565b5b602082029050919050565b600067ffffffffffffffff8211156118ff576118fe611b4d565b5b602082029050919050565b600082825260208201905092915050565b600061192682611a0b565b915061193183611a0b565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111561196657611965611ac0565b5b828201905092915050565b600061197c82611a0b565b915061198783611a0b565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156119c0576119bf611ac0565b5b828202905092915050565b60006119d682611a0b565b91506119e183611a0b565b9250828210156119f4576119f3611ac0565b5b828203905092915050565b60008115159050919050565b6000819050919050565b611a1e82611b8b565b810181811067ffffffffffffffff82111715611a3d57611a3c611b4d565b5b80604052505050565b6000611a5182611a0b565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff821415611a8457611a83611ac0565b5b600182019050919050565b6000611a9a82611a0b565b9150611aa583611a0b565b925082611ab557611ab4611aef565b5b828206905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f76657269666965722d6261642d696e7075740000000000000000000000000000600082015250565b7f70616972696e672d6d756c2d6661696c65640000000000000000000000000000600082015250565b7f76657269666965722d6774652d736e61726b2d7363616c61722d6669656c6400600082015250565b7f70616972696e672d6c656e677468732d6661696c656400000000000000000000600082015250565b7f70616972696e672d6164642d6661696c65640000000000000000000000000000600082015250565b7f70616972696e672d6f70636f64652d6661696c65640000000000000000000000600082015250565b611c9b81611a0b565b8114611ca657600080fd5b5056fea2646970667358221220c4a5e734aa341861d48b42b343a592b4461ac738953008141d1dc96df705ffd364736f6c63430008050033";

type Verifier20_2ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: Verifier20_2ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Verifier20_2__factory extends ContractFactory {
  constructor(...args: Verifier20_2ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Verifier20_2> {
    return super.deploy(overrides || {}) as Promise<Verifier20_2>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Verifier20_2 {
    return super.attach(address) as Verifier20_2;
  }
  override connect(signer: Signer): Verifier20_2__factory {
    return super.connect(signer) as Verifier20_2__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): Verifier20_2Interface {
    return new utils.Interface(_abi) as Verifier20_2Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Verifier20_2 {
    return new Contract(address, _abi, signerOrProvider) as Verifier20_2;
  }
}
