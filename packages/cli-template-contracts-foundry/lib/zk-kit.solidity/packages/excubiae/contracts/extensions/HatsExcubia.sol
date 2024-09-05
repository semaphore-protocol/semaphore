// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {Excubia} from "../Excubia.sol";
import {IHatsMinimal} from "./interfaces/IHatsMinimal.sol";

/// @title Hats Excubia Contract.
/// @notice This contract extends the Excubia contract to integrate with the Hats protocol.
/// This contract checks if a user is wearing a specific hat to permit access through the gate.
/// @dev The contract uses a specific set of hats to admit the passerby wearing any of those hats.
contract HatsExcubia is Excubia {
    /// @notice The Hats contract interface.
    IHatsMinimal public immutable HATS;

    /// @notice Mapping to track which hats are considered valid for passing the gate.
    mapping(uint256 => bool) public criterionHat;
    /// @notice Mapping to track which users have already passed through the gate.
    mapping(address => bool) public passedUsers;

    /// @notice Error thrown when the user is not wearing the required hat.
    error NotWearingCriterionHat();
    /// @notice Error thrown when the specified hat is not a criterion hat.
    error NotCriterionHat();
    /// @notice Error thrown when the array of criterion hats is empty.
    error ZeroCriterionHats();

    /// @notice Constructor to initialize the contract with the target Hats contract and criterion hats.
    /// @param _hats The address of the Hats contract.
    /// @param _criterionHats An array of hat IDs that are considered as criteria for passing the gate.
    constructor(address _hats, uint256[] memory _criterionHats) {
        if (_hats == address(0)) revert ZeroAddress();
        if (_criterionHats.length == 0) revert ZeroCriterionHats();

        HATS = IHatsMinimal(_hats);

        uint256 numberOfCriterionHats = _criterionHats.length;

        for (uint256 i = 0; i < numberOfCriterionHats; ++i) {
            criterionHat[_criterionHats[i]] = true;
        }
    }

    /// @notice The trait of the Excubia contract.
    function trait() external pure override returns (string memory) {
        return "Hats";
    }

    /// @notice Internal function to handle the passing logic with check.
    /// @dev Calls the parent `_pass` function and stores the user to avoid passing the gate twice.
    /// @param passerby The address of the entity attempting to pass the gate.
    /// @param data Additional data required for the check.
    function _pass(address passerby, bytes calldata data) internal override {
        // Avoiding passing the gate twice for the same user.
        if (passedUsers[passerby]) revert AlreadyPassed();

        passedUsers[passerby] = true;

        super._pass(passerby, data);
    }

    /// @notice Internal function to handle the gate protection (hat check) logic.
    /// @dev Checks if the user is wearing one of the criterion hats.
    /// @param passerby The address of the entity attempting to pass the gate.
    /// @param data Additional data required for the check.
    function _check(address passerby, bytes calldata data) internal view override {
        super._check(passerby, data);

        uint256 hat = abi.decode(data, (uint256));

        // Check if the hat is a criterion hat.
        if (!criterionHat[hat]) revert NotCriterionHat();

        // Check if the user is wearing the criterion hat.
        if (!HATS.isWearerOfHat(passerby, hat)) revert NotWearingCriterionHat();
    }
}
