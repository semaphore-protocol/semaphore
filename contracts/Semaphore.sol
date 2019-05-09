pragma solidity >=0.4.21;

import "./verifier.sol";

library MiMC {
    function MiMCpe7(uint256 in_x, uint256 in_k)  pure public returns (uint256 out_x);
}

contract Semaphore is Verifier {
    address public owner;

    modifier onlyOwner() {
        if (msg.sender == owner) _;
    }

    function updateIdentity(bytes memory leaf) public onlyOwner {
        MiMC.MiMCpe7(5, 5);
    }

    function broadcastSignal(
        bytes memory signal, 
        uint[2] a,
        uint[2][2] b,
        uint[2] c,
        uint[4] input
    ) public {

    }
}