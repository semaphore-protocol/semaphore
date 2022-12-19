// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DeterministicDeployFactory {
    event Deploy(address addr);

    function deploy(bytes memory bytecode, uint _salt) external {
        address addr;
        assembly {
            addr := create2(0, add(bytecode, 0x20), mload(bytecode), _salt)
            if iszero(extcodesize(addr)) {
        revert(0, 0)
      }
    }

    emit Deploy(addr);
    }
}

