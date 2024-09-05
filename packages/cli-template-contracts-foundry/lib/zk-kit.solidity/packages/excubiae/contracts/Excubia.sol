// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IExcubia} from "./IExcubia.sol";

/// @title Excubia.
/// @notice Abstract base contract which can be extended to implement a specific excubia.
/// @dev Inherit from this contract and implement the `_pass` & `_check` methods to define
/// your custom gatekeeping logic.
abstract contract Excubia is IExcubia, Ownable(msg.sender) {
    /// @notice The excubia-protected contract address.
    /// @dev The gate can be any contract address that requires a prior check to enable logic.
    /// For example, the gate is a Semaphore group that requires the passerby
    /// to meet certain criteria before joining.
    address public gate;

    /// @dev Modifier to restrict function calls to only from the gate address.
    modifier onlyGate() {
        if (msg.sender != gate) revert GateOnly();
        _;
    }

    /// @inheritdoc IExcubia
    function trait() external pure virtual returns (string memory) {}

    /// @inheritdoc IExcubia
    function setGate(address _gate) public virtual onlyOwner {
        if (_gate == address(0)) revert ZeroAddress();
        if (gate != address(0)) revert GateAlreadySet();

        gate = _gate;

        emit GateSet(_gate);
    }

    /// @inheritdoc IExcubia
    function pass(address passerby, bytes calldata data) external onlyGate {
        _pass(passerby, data);
    }

    /// @inheritdoc IExcubia
    function check(address passerby, bytes calldata data) external view {
        _check(passerby, data);
    }

    /// @notice Internal function to enforce the custom gate passing logic.
    /// @dev Calls the `_check` internal logic and emits the relative event if successful.
    /// @param passerby The address of the entity attempting to pass the gate.
    /// @param data Additional data required for the check (e.g., encoded token identifier).
    function _pass(address passerby, bytes calldata data) internal virtual {
        _check(passerby, data);

        emit GatePassed(passerby, gate);
    }

    /// @notice Internal function to define the custom gate protection logic.
    /// @dev Custom logic to determine if the passerby can pass the gate.
    /// @param passerby The address of the entity attempting to pass the gate.
    /// @param data Additional data that may be required for the check.
    function _check(address passerby, bytes calldata data) internal view virtual {}
}
