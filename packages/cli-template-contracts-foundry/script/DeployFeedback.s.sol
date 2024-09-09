// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Feedback} from "../src/Feedback.sol";
import {Semaphore} from "@semaphore/contracts/contracts/Semaphore.sol";
import {SemaphoreVerifier} from "@semaphore/contracts/contracts/base/SemaphoreVerifier.sol";
import {ISemaphoreVerifier} from "@semaphore/contracts/contracts/interfaces/ISemaphoreVerifier.sol";
import "forge-std/Script.sol";

contract DeployFeedback is Script {
    function run() external returns (address, address) {

        vm.startBroadcast();

        // Deploy SemaphoreVerifier for Semaphore
        SemaphoreVerifier semaphoreVerifier = new SemaphoreVerifier();
        ISemaphoreVerifier IsemaphoreVerifier = ISemaphoreVerifier(address(semaphoreVerifier));

        // Deploy Semaphore for Feedback
        Semaphore semaphore = new Semaphore(IsemaphoreVerifier);

        // Deploy Feedback
        Feedback feedback = new Feedback(address(semaphore));

        vm.stopBroadcast();

        console.log("Feedback contract has been deployed to:", address(feedback));

        return (address(feedback), address(semaphore));
    }
}