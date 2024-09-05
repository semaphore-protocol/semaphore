// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// @title IExcubia.
/// @notice Excubia contract interface.
interface IExcubia {
    /// @notice Event emitted when someone passes the gate check.
    /// @param passerby The address of those who have successfully passed the check.
    /// @param gate The address of the excubia-protected contract address.
    event GatePassed(address indexed passerby, address indexed gate);

    /// @notice Event emitted when the gate address is set.
    /// @param gate The address of the contract set as the gate.
    event GateSet(address indexed gate);

    /// @notice Error thrown when an address equal to zero is given.
    error ZeroAddress();

    /// @notice Error thrown when the gate address is not set.
    error GateNotSet();

    /// @notice Error thrown when the callee is not the gate contract.
    error GateOnly();

    /// @notice Error thrown when the gate address has been already set.
    error GateAlreadySet();

    /// @notice Error thrown when the passerby has already passed the gate.
    error AlreadyPassed();

    /// @notice Gets the trait of the Excubia contract.
    /// @return The specific trait of the Excubia contract (e.g., SemaphoreExcubia has trait `Semaphore`).
    function trait() external pure returns (string memory);

    /// @notice Sets the gate address.
    /// @dev Only the owner can set the destination gate address.
    /// @param _gate The address of the contract to be set as the gate.
    function setGate(address _gate) external;

    /// @notice Enforces the custom gate passing logic.
    /// @dev Must call the `check` to handle the logic of checking passerby for specific gate.
    /// @param passerby The address of the entity attempting to pass the gate.
    /// @param data Additional data required for the check (e.g., encoded token identifier).
    function pass(address passerby, bytes calldata data) external;

    /// @dev Defines the custom gate protection logic.
    /// @param passerby The address of the entity attempting to pass the gate.
    /// @param data Additional data that may be required for the check.
    function check(address passerby, bytes calldata data) external view;
}
