//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

/// @title Greeter contract.
/// @dev The following code is just a example to show how Semaphore can be used.
contract Greeter {
    event NewGreeting(bytes32 greeting);
    event NewUser(uint256 identityCommitment, bytes32 username);

    ISemaphore public semaphore;

    uint256 groupId;
    mapping(uint256 => bytes32) users;

    constructor(address semaphoreAddress, uint256 _groupId) {
        semaphore = ISemaphore(semaphoreAddress);
        groupId = _groupId;

        semaphore.createGroup(groupId, 20, address(this));
    }

    function joinGroup(uint256 identityCommitment, bytes32 username) external {
        semaphore.addMember(groupId, identityCommitment);

        users[identityCommitment] = username;

        emit NewUser(identityCommitment, username);
    }

    function greet(
        bytes32 greeting,
        uint256 merkleTreeRoot,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        semaphore.verifyProof(groupId, merkleTreeRoot, uint256(greeting), nullifierHash, groupId, proof);

        emit NewGreeting(greeting);
    }
}
