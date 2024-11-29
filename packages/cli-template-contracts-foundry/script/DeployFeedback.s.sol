// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Feedback} from "../src/Feedback.sol";
import {Semaphore} from "@semaphore/contracts/Semaphore.sol";
import {SemaphoreVerifier} from "@semaphore/contracts/base/SemaphoreVerifier.sol";
import {ISemaphoreVerifier} from "@semaphore/contracts/interfaces/ISemaphoreVerifier.sol";
import {console, Script} from "forge-std/Script.sol";

contract DeployFeedback is Script {
    function run() external returns (address feedbackAddr, address semaphoreAddr) {
        address semaphoreVerifierAddr;

        // Default to use the first test user private key of anvil node
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
        );
        bool log = vm.envOr("LOG", false);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy SemaphoreVerifier
        SemaphoreVerifier semaphoreVerifierContract = new SemaphoreVerifier();
        semaphoreVerifierAddr = address(semaphoreVerifierContract);

        // Deploy Semaphore
        Semaphore semaphoreContract = new Semaphore(ISemaphoreVerifier(semaphoreVerifierAddr));
        semaphoreAddr = address(semaphoreContract);

        // Deploy Feedback
        Feedback feedbackContract = new Feedback(semaphoreAddr);
        feedbackAddr = address(feedbackContract);

        vm.stopBroadcast();

        if (log) {
            /* solhint-disable no-console */
            console.log("SemaphoreVerifier contract has been deployed to:", semaphoreVerifierAddr);
            console.log("Semaphore contract has been deployed to:", semaphoreAddr);
            console.log("Feedback contract has been deployed to:", feedbackAddr);
            /* solhint-enable no-console */
        }
    }
}
