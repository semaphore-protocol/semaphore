// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Feedback} from "../src/Feedback.sol";
import {Semaphore} from "@semaphore/contracts/Semaphore.sol";
import {SemaphoreVerifier} from "@semaphore/contracts/base/SemaphoreVerifier.sol";
import {ISemaphoreVerifier} from "@semaphore/contracts/interfaces/ISemaphoreVerifier.sol";
import {Script} from "forge-std/Script.sol";

// Passing SALT parameter to use CREATE2 for deterministic contract address
bytes32 constant SALT = bytes32(0);

contract DeployFeedback is Script {
    function run() external returns (address feedbackAddr, address semaphoreAddr, address semaphoreVerifierAddr) {
        // Default to use the first test user private key of anvil node
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
        );

        vm.startBroadcast(deployerPrivateKey);

        // Deploy SemaphoreVerifier
        SemaphoreVerifier semaphoreVerifierContract = new SemaphoreVerifier{salt: SALT}();
        semaphoreVerifierAddr = address(semaphoreVerifierContract);

        // Deploy Semaphore
        Semaphore semaphoreContract = new Semaphore{salt: SALT}(ISemaphoreVerifier(semaphoreVerifierAddr));
        semaphoreAddr = address(semaphoreContract);

        // Deploy Feedback
        Feedback feedbackContract = new Feedback{salt: SALT}(semaphoreAddr);
        feedbackAddr = address(feedbackContract);

        vm.stopBroadcast();
    }
}
