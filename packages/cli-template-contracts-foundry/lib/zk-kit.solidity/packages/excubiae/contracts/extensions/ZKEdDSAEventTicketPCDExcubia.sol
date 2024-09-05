// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {Excubia} from "../Excubia.sol";
import {ZKEdDSAEventTicketPCDVerifier} from "./verifiers/ZKEdDSAEventTicketPCDVerifier.sol";

/// @title ZKEdDSA Event Ticket PCD Excubia Contract.
/// @notice This contract extends the Excubia contract to integrate with ZK EdDSA Event Ticket PCD.
/// This contract verifies a ZK EdDSA Event Ticket PCD proof to permit access through the gate.
/// You can find more about on the Zupass repository https://github.com/proofcarryingdata/zupass.
/// @dev The contract uses specific event ID and signers to check against the verifier
/// in order to admit the recipient (passerby) of the proof.
contract ZKEdDSAEventTicketPCDExcubia is Excubia {
    /// @notice The valid event ID that proofs must match to pass the gate.
    uint256 public immutable VALID_EVENT_ID;
    /// @notice The first valid signer whose signatures are considered valid to pass the gate.
    uint256 public immutable VALID_SIGNER_1;
    /// @notice The second valid signer whose signatures are considered valid to pass the gate.
    uint256 public immutable VALID_SIGNER_2;

    /// @notice The ZKEdDSA Event Ticket PCD Verifier contract.
    ZKEdDSAEventTicketPCDVerifier public immutable VERIFIER;

    /// @notice Mapping to track which tickets have already passed the checks
    /// to avoid passing the gate twice with the same ticket.
    mapping(uint256 => bool) public passedZKEdDSAEventTicketPCDs;

    /// @notice Error thrown when the proof is invalid.
    error InvalidProof();

    /// @notice Error thrown when the event ID in the proof does not match the valid event ID.
    error InvalidEventId();

    /// @notice Error thrown when the signers in the proof do not match the valid signers.
    error InvalidSigners();

    /// @notice Error thrown when the watermark in the proof does not match the passerby address.
    error InvalidWatermark();

    /// @notice Constructor to initialize with target verifier, valid event ID, and valid signers.
    /// @param _verifier The address of the ZKEdDSA Event Ticket PCD Verifier contract.
    /// @param _validEventId The valid event ID that proofs must match.
    /// @param _validSigner1 The first valid signer whose signatures are considered valid.
    /// @param _validSigner2 The second valid signer whose signatures are considered valid.
    constructor(address _verifier, uint256 _validEventId, uint256 _validSigner1, uint256 _validSigner2) {
        if (_verifier == address(0)) revert ZeroAddress();

        VERIFIER = ZKEdDSAEventTicketPCDVerifier(_verifier);
        VALID_EVENT_ID = _validEventId;
        VALID_SIGNER_1 = _validSigner1;
        VALID_SIGNER_2 = _validSigner2;
    }

    /// @notice The trait of the Excubia contract.
    function trait() external pure override returns (string memory) {
        return "ZKEdDSAEventTicketPCD";
    }

    /// @notice Internal function to handle the passing logic with check.
    /// @dev Calls the parent `_pass` function and stores the ticket ID to avoid passing the gate twice.
    /// @param passerby The address of the entity attempting to pass the gate.
    /// @param data Additional data required for the check (i.e., encoded proof).
    function _pass(address passerby, bytes calldata data) internal override {
        // Decode the given data bytes.
        (, , , uint256[38] memory _pubSignals) = abi.decode(data, (uint256[2], uint256[2][2], uint256[2], uint256[38]));

        // Avoiding passing the gate twice using the same nullifier.
        /// @dev Ticket ID is stored at _pubSignals index 0.
        if (passedZKEdDSAEventTicketPCDs[_pubSignals[0]]) revert AlreadyPassed();

        passedZKEdDSAEventTicketPCDs[_pubSignals[0]] = true;

        super._pass(passerby, data);
    }

    /// @notice Internal function to handle the gate protection (proof check) logic.
    /// @dev Checks if the proof matches the event ID, signers, watermark, and is valid.
    /// @param passerby The address of the entity attempting to pass the gate.
    /// @param data Additional data required for the check (i.e., encoded proof).
    function _check(address passerby, bytes calldata data) internal view override {
        super._check(passerby, data);

        // Decode the given data bytes.
        (uint256[2] memory _pA, uint256[2][2] memory _pB, uint256[2] memory _pC, uint256[38] memory _pubSignals) = abi
            .decode(data, (uint256[2], uint256[2][2], uint256[2], uint256[38]));

        // Signers are stored at index 13 and 14.
        if (_pubSignals[13] != VALID_SIGNER_1 || _pubSignals[14] != VALID_SIGNER_2) revert InvalidSigners();

        // Event ID is stored at index 15.
        if (_pubSignals[15] != VALID_EVENT_ID) revert InvalidEventId();

        // Watermark is stored at index 37.
        if (_pubSignals[37] != uint256(uint160(passerby))) revert InvalidWatermark();

        // Proof verification.
        if (!VERIFIER.verifyProof(_pA, _pB, _pC, _pubSignals)) revert InvalidProof();
    }
}
