// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IHatsMinimal} from "../extensions/interfaces/IHatsMinimal.sol";

/// @title Mock Hats Protocol Contract
/// @notice This contract is a mock implementation of the IHatsMinimal interface for testing purposes.
/// @dev It simulates the behavior of a real Hats protocol contract by providing predefined functionality
/// for minting and checking hats.
contract MockHats is IHatsMinimal {
    /// @notice A mapping to store the hats worn by each wearer address.
    mapping(address => uint256[]) private mockedWearers;

    /// @notice Constructor to initialize the mock contract with predefined hats and wearers.
    /// @param _hatsIds An array of hat IDs.
    /// @param _wearers An array of wearer addresses corresponding to the hat IDs.
    constructor(uint256[] memory _hatsIds, address[] memory _wearers) {
        for (uint256 i = 0; i < _hatsIds.length; i++) {
            mintHat(_hatsIds[i], _wearers[i]);
        }
    }

    /// @notice Mock function to mint a hat for a wearer.
    /// @dev This function simulates the minting of a hat by adding the hat ID to the wearer's list of hats.
    /// @param _hatId The ID of the hat to mint.
    /// @param _wearer The address of the wearer to mint the hat for.
    /// @return success A boolean indicating the success of the operation (always returns true).
    function mintHat(uint256 _hatId, address _wearer) public returns (bool success) {
        mockedWearers[_wearer].push(_hatId);
        return true;
    }

    /// @notice Mock function to check if an account is wearing a specific hat.
    /// @dev This function checks if the hat ID is present in the wearer's list of hats.
    /// @param account The address of the account to check.
    /// @param hat The ID of the hat to check.
    /// @return True if the account is wearing the hat, false otherwise.
    function isWearerOfHat(address account, uint256 hat) external view returns (bool) {
        uint256[] memory hats = mockedWearers[account];
        for (uint256 i = 0; i < hats.length; i++) {
            if (hats[i] == hat) {
                return true;
            }
        }
        return false;
    }

    /// STUBS ///
    function mintTopHat(
        address /*_target*/,
        string calldata /*_details*/,
        string calldata /*_imageURI*/
    ) external pure returns (uint256) {
        return 0;
    }

    function createHat(
        uint256 /*_admin*/,
        string calldata /*_details*/,
        uint32 /*_maxSupply*/,
        address /*_eligibility*/,
        address /*_toggle*/,
        bool /*_mutable*/,
        string calldata /*_imageURI*/
    ) external pure returns (uint256) {
        return 0;
    }
}
