/// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

import "hardhat/console.sol";

interface Poseidon2 {
  function poseidon(uint[1] calldata) external pure returns (uint);
}

interface _PoseidonT2 {
  function hash(uint[1] calldata) external pure returns (uint);
}

interface Poseidon3 {
  function poseidon(uint[2] calldata) external pure returns (uint);
}

interface _PoseidonT3 {
  function hash(uint[2] calldata) external pure returns (uint);
}

interface Poseidon4 {
  function poseidon(uint[3] calldata) external pure returns (uint);
}

interface _PoseidonT4 {
  function hash(uint[3] calldata) external pure returns (uint);
}

interface Poseidon5 {
  function poseidon(uint[4] calldata) external pure returns (uint);
}

interface _PoseidonT5 {
  function hash(uint[4] calldata) external pure returns (uint);
}

interface Poseidon6 {
  function poseidon(uint[5] calldata) external pure returns (uint);
}

interface _PoseidonT6 {
  function hash(uint[5] calldata) external pure returns (uint);
}

interface Poseidon7 {
  function poseidon(uint[6] calldata) external pure returns (uint);
}

interface _PoseidonT7 {
  function hash(uint[6] calldata) external pure returns (uint);
}

interface Poseidon8 {
  function poseidon(uint[7] calldata) external pure returns (uint);
}

interface _PoseidonT8 {
  function hash(uint[7] calldata) external pure returns (uint);
}

interface Poseidon9 {
  function poseidon(uint[8] calldata) external pure returns (uint);
}

interface _PoseidonT9 {
  function hash(uint[8] calldata) external pure returns (uint);
}

contract Test {
  // Benchmark poseidon-solidity
  function benchmarkA2(address p, uint[1] memory inputs) public view returns (uint) {
    uint g = gasleft();
    uint r = _PoseidonT2(p).hash(inputs);
    console.log(g-gasleft());
    return r;
  }

  // Benchmark circomlibjs
  function benchmarkB2(address p, uint[1] memory inputs) public view returns (uint) {
    uint g = gasleft();
    uint r = Poseidon2(p).poseidon(inputs);
    console.log(g-gasleft());
    return r;
  }
  // Benchmark poseidon-solidity
  function benchmarkA3(address p, uint[2] memory inputs) public view returns (uint) {
    uint g = gasleft();
    uint r = _PoseidonT3(p).hash(inputs);
    console.log(g-gasleft());
    return r;
  }

  // Benchmark circomlibjs
  function benchmarkB3(address p, uint[2] memory inputs) public view returns (uint) {
    uint g = gasleft();
    uint r = Poseidon3(p).poseidon(inputs);
    console.log(g-gasleft());
    return r;
  }
  // Benchmark poseidon-solidity
  function benchmarkA4(address p, uint[3] memory inputs) public view returns (uint) {
    uint g = gasleft();
    uint r = _PoseidonT4(p).hash(inputs);
    console.log(g-gasleft());
    return r;
  }

  // Benchmark circomlibjs
  function benchmarkB4(address p, uint[3] memory inputs) public view returns (uint) {
    uint g = gasleft();
    uint r = Poseidon4(p).poseidon(inputs);
    console.log(g-gasleft());
    return r;
  }
  // Benchmark poseidon-solidity
  function benchmarkA5(address p, uint[4] memory inputs) public view returns (uint) {
    uint g = gasleft();
    uint r = _PoseidonT5(p).hash(inputs);
    console.log(g-gasleft());
    return r;
  }

  // Benchmark circomlibjs
  function benchmarkB5(address p, uint[4] memory inputs) public view returns (uint) {
    uint g = gasleft();
    uint r = Poseidon5(p).poseidon(inputs);
    console.log(g-gasleft());
    return r;
  }
  // Benchmark poseidon-solidity
  function benchmarkA6(address p, uint[5] memory inputs) public view returns (uint) {
    uint g = gasleft();
    uint r = _PoseidonT6(p).hash(inputs);
    console.log(g-gasleft());
    return r;
  }

  // Benchmark circomlibjs
  function benchmarkB6(address p, uint[5] memory inputs) public view returns (uint) {
    uint g = gasleft();
    uint r = Poseidon6(p).poseidon(inputs);
    console.log(g-gasleft());
    return r;
  }
  // Benchmark poseidon-solidity
  function benchmarkA7(address p, uint[6] memory inputs) public view returns (uint) {
    uint g = gasleft();
    uint r = _PoseidonT7(p).hash(inputs);
    console.log(g-gasleft());
    return r;
  }

  // Benchmark circomlibjs
  function benchmarkB7(address p, uint[6] memory inputs) public view returns (uint) {
    uint g = gasleft();
    uint r = Poseidon7(p).poseidon(inputs);
    console.log(g-gasleft());
    return r;
  }
  // Benchmark poseidon-solidity
  function benchmarkA8(address p, uint[7] memory inputs) public view returns (uint) {
    uint g = gasleft();
    uint r = _PoseidonT8(p).hash(inputs);
    console.log(g-gasleft());
    return r;
  }

  // Benchmark circomlibjs
  function benchmarkB8(address p, uint[7] memory inputs) public view returns (uint) {
    uint g = gasleft();
    uint r = Poseidon8(p).poseidon(inputs);
    console.log(g-gasleft());
    return r;
  }
  // Benchmark poseidon-solidity
  function benchmarkA9(address p, uint[8] memory inputs) public view returns (uint) {
    uint g = gasleft();
    uint r = _PoseidonT9(p).hash(inputs);
    console.log(g-gasleft());
    return r;
  }

  // Benchmark circomlibjs
  function benchmarkB9(address p, uint[8] memory inputs) public view returns (uint) {
    uint g = gasleft();
    uint r = Poseidon9(p).poseidon(inputs);
    console.log(g-gasleft());
    return r;
  }
}
