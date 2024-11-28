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
