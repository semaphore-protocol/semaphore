// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Feedback} from "../src/Feedback.sol";
import {Semaphore} from "@semaphore/contracts/Semaphore.sol";
import {SemaphoreVerifier} from "@semaphore/contracts/base/SemaphoreVerifier.sol";
import {ISemaphoreVerifier} from "@semaphore/contracts/interfaces/ISemaphoreVerifier.sol";
import {console, Script} from "forge-std/Script.sol";

contract DeployFeedback is Script {
    function run() external returns (address, address) {
        address semaphoreVerifierAddress;
        address semaphoreAddress;

        // Targeting Ethereum Sepolia
        if (block.chainid == 11155111) {
            semaphoreVerifierAddress = 0xe538f9DeeE04A397decb1E7dc5D16fD6f123c043;
            semaphoreAddress = 0x1e0d7FF1610e480fC93BdEC510811ea2Ba6d7c2f;
        }

        vm.startBroadcast();

        if (semaphoreAddress == address(0)) {
            // Deploy SemaphoreVerifier
            SemaphoreVerifier semaphoreVerifier = new SemaphoreVerifier();
            semaphoreVerifierAddress = address(semaphoreVerifier);

            // Deploy Semaphore
            Semaphore semaphore = new Semaphore(ISemaphoreVerifier(semaphoreVerifierAddress));
            semaphoreAddress = address(semaphore);
        }

        // Deploy Feedback
        Feedback feedback = new Feedback(semaphoreAddress);

        vm.stopBroadcast();

        // solhint-disable-next-line no-console
        console.log("Feedback contract has been deployed to:", address(feedback));

        return (address(feedback), semaphoreAddress);
    }
}
