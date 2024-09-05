// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Feedback} from "../src/Feedback.sol";
import {Semaphore} from "@semaphore/contracts/contracts/Semaphore.sol";
import {SemaphoreVerifier} from "@semaphore/contracts/contracts/base/SemaphoreVerifier.sol";
import {ISemaphoreVerifier} from "@semaphore/contracts/contracts/interfaces/ISemaphoreVerifier.sol";
import {Script, console} from "forge-std/Script.sol";

contract DeployFeedback is Script {
    function run() external returns (address, address) {

        SemaphoreVerifier semaphoreVerifier;
        address semaphoreVerifierAddress;
        ISemaphoreVerifier IsemaphoreVerifier;
        Semaphore semaphore;
        address semaphoreAddress;
        Feedback feedback;

        vm.startBroadcast();
        semaphoreVerifier = new SemaphoreVerifier();
        semaphoreVerifierAddress = address(semaphoreVerifier);
        IsemaphoreVerifier = ISemaphoreVerifier(semaphoreVerifierAddress);

        semaphore = new Semaphore(IsemaphoreVerifier);
        semaphoreAddress = address(semaphore);

        feedback = new Feedback(semaphoreAddress);
        vm.stopBroadcast();

        console.log("Feedback contract has been deployed to:", address(feedback));

        return (address(feedback), semaphoreAddress);
    }
}