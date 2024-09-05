// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {Excubia} from "../Excubia.sol";
import {IGitcoinPassportDecoder} from "./interfaces/IGitcoinPassportDecoder.sol";

/// @title Gitcoin Passport Excubia Contract.
/// @notice This contract extends the Excubia contract to integrate with the Gitcoin Passport Decoder.
/// This contract checks the Gitcoin Passport user score to permit access through the gate.
/// The Gitcoin Passport smart contract stack is built on top of Ethereum Attestation Service (EAS) contracts.
/// @dev The contract uses a fixed threshold score to admit only passersby with a passport score
/// equal to or greater than the fixed threshold  based on their score (see _check() for more).
contract GitcoinPassportExcubia is Excubia {
    /// @notice The factor used to scale the score.
    /// @dev https://docs.passport.xyz/building-with-passport/smart-contracts/contract-reference#available-methods
    uint256 public constant FACTOR = 100;

    /// @notice The Gitcoin Passport Decoder contract interface.
    IGitcoinPassportDecoder public immutable DECODER;

    /// @notice The minimum threshold score required to pass the gate.
    uint256 public immutable THRESHOLD_SCORE;

    /// @notice Mapping to track which users have already passed through the gate.
    mapping(address => bool) public passedUsers;

    /// @notice Error thrown when the user's score is insufficient to pass the gate.
    error InsufficientScore();

    /// @notice Error thrown when the threshold score is negative or zero.
    error NegativeOrZeroThresholdScore();

    /// @notice Constructor to initialize the contract with the target decoder and threshold score.
    /// @param _decoder The address of the Gitcoin Passport Decoder contract.
    /// @param _thresholdScore The minimum threshold score required to pass the gate.
    constructor(address _decoder, uint256 _thresholdScore) {
        if (_decoder == address(0)) revert ZeroAddress();
        if (_thresholdScore <= 0) revert NegativeOrZeroThresholdScore();

        DECODER = IGitcoinPassportDecoder(_decoder);
        THRESHOLD_SCORE = _thresholdScore;
    }

    /// @notice The trait of the Excubia contract.
    function trait() external pure override returns (string memory) {
        return "GitcoinPassport";
    }

    /// @notice Internal function to handle the passing logic with check.
    /// @dev Calls the parent `_pass` function and stores the user to avoid passing the gate twice.
    /// @param passerby The address of the entity attempting to pass the gate.
    /// @param data Additional data required for the check.
    function _pass(address passerby, bytes calldata data) internal override {
        if (passedUsers[passerby]) revert AlreadyPassed();

        passedUsers[passerby] = true;

        super._pass(passerby, data);
    }

    /// @notice Internal function to handle the gate protection (score check) logic.
    /// @dev Checks if the user's Gitcoin Passport score meets the threshold.
    /// @param passerby The address of the entity attempting to pass the gate.
    /// @param data Additional data required for the check.
    function _check(address passerby, bytes calldata data) internal view override {
        super._check(passerby, data);

        if ((DECODER.getScore(passerby) / FACTOR) < THRESHOLD_SCORE) revert InsufficientScore();
    }
}
