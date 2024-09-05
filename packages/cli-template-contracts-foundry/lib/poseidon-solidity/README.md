# poseidon-solidity [![CircleCI](https://img.shields.io/circleci/build/github/vimwitch/poseidon-solidity/main)](https://dl.circleci.com/status-badge/redirect/gh/vimwitch/poseidon-solidity/tree/main)

Poseidon implementation in Solidity over alt_bn128 (aka BN254).

**This implementation has not been audited.**

## Benchmark

```yaml
T2 hash
  - poseidon-solidity: 13,488 gas
  - circomlibjs: 19,395 gas
  - address: 0x22233340039aAB0C858bc6086f508d9A4f2fA4db

T3 hash
  - poseidon-solidity: 21,124 gas
  - circomlibjs: 32,173 gas
  - address: 0x3333333C0A88F9BE4fd23ed0536F9B6c427e3B93

T4 hash
  - poseidon-solidity: 37,617 gas
  - circomlibjs: 48,267 gas
  - address: 0x4443338EF595F44e0121df4C21102677B142ECF0

T5 hash
  - poseidon-solidity: 54,326 gas
  - circomlibjs: 73,307 gas
  - address: 0x555333f3f677Ca3930Bf7c56ffc75144c51D9767

T6 hash
  - poseidon-solidity: 74,039 gas
  - circomlibjs: 100,197 gas
  - address: 0x666333F371685334CdD69bdDdaFBABc87CE7c7Db

# ---

Deploy cost (T3)
  - poseidon-solidity: 5,129,638 gas
  - circomlibjs: 2,156,516 gas
```

## Use

```sh
npm i poseidon-solidity
```

```solidity
import "poseidon-solidity/PoseidonT3.sol";

contract Example {

  function combine(uint input0, uint input1) public {
    uint out = PoseidonT3.hash([input0, input1]);
  }

}
```

## Deploy

This package includes config info for deploying with a [deterministic proxy](https://github.com/Arachnid/deterministic-deployment-proxy). The proxy itself is deployed using [Nick's method](https://eips.ethereum.org/EIPS/eip-1820#deployment-method) with a pre-signed transaction from a keyless address. The poseidon contracts are deployed through this proxy to get the same address in any evm.

To deploy in a hardhat/ethers type environment:

```js
const { proxy, PoseidonT3 } = require('poseidon-solidity')

const [sender] = await ethers.getSigners()

// First check if the proxy exists
if (await ethers.provider.getCode(proxy.address) === '0x') {
  // fund the keyless account
  await sender.sendTransaction({
    to: proxy.from,
    value: proxy.gas,
  })

  // then send the presigned transaction deploying the proxy
  await ethers.provider.sendTransaction(proxy.tx)
}

// Then deploy the hasher, if needed
if (await ethers.provider.getCode(PoseidonT3.address) === '0x') {
  await send.sendTransaction({
    to: proxy.address,
    data: PoseidonT3.data
  })
}

console.log(`PoseidonT3 deployed to: ${PoseidonT3.address}`)
```

## Testing

```sh
npm install
npm test
```

<br />

<div align="center">
<a href="https://appliedzkp.org">
<img width="50px" height="auto" src="https://raw.githubusercontent.com/vimwitch/poseidon-solidity/main/pse_logo.svg" />
</a>
</div>
