// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {Excubia} from "../Excubia.sol";
import {IEAS} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import {Attestation} from "@ethereum-attestation-service/eas-contracts/contracts/Common.sol";

/// @title EAS Excubia Contract.
/// @notice This contract extends the Excubia contract to integrate with the Ethereum Attestation Service (EAS).
/// This contract checks an EAS attestation to permit access through the gate.
/// @dev The contract uses a specific attestation schema & attester to admit the recipient of the attestation.
contract EASExcubia is Excubia {
    /// @notice The Ethereum Attestation Service contract interface.
    IEAS public immutable EAS;
    /// @notice The specific schema ID that attestations must match to pass the gate.
    bytes32 public immutable SCHEMA;
    /// @notice The trusted attester address whose attestations are considered
    /// the only ones valid to pass the gate.
    address public immutable ATTESTER;

    /// @notice Mapping to track which attestations have passed the gate to
    /// avoid passing it twice using the same attestation.
    mapping(bytes32 => bool) public passedAttestations;

    /// @notice Error thrown when the attestation does not match the designed schema.
    error UnexpectedSchema();

    /// @notice Error thrown when the attestation does not match the designed trusted attester.
    error UnexpectedAttester();

    /// @notice Error thrown when the attestation does not match the passerby as recipient.
    error UnexpectedRecipient();

    /// @notice Error thrown when the attestation has been revoked.
    error RevokedAttestation();

    /// @notice Constructor to initialize with target EAS contract with specific attester and schema.
    /// @param _eas The address of the EAS contract.
    /// @param _attester The address of the trusted attester.
    /// @param _schema The schema ID that attestations must match.
    constructor(address _eas, address _attester, bytes32 _schema) {
        if (_eas == address(0) || _attester == address(0)) revert ZeroAddress();

        EAS = IEAS(_eas);
        ATTESTER = _attester;
        SCHEMA = _schema;
    }

    /// @notice The trait of the Excubia contract.
    function trait() external pure override returns (string memory) {
        return "EAS";
    }

    /// @notice Internal function to handle the passing logic with check.
    /// @dev Calls the parent `_pass` function and stores the attestation to avoid pass the gate twice.
    /// @param passerby The address of the entity attempting to pass the gate.
    /// @param data Additional data required for the check (e.g., encoded attestation ID).
    function _pass(address passerby, bytes calldata data) internal override {
        bytes32 attestationId = abi.decode(data, (bytes32));

        // Avoiding passing the gate twice using the same attestation.
        if (passedAttestations[attestationId]) revert AlreadyPassed();

        passedAttestations[attestationId] = true;

        super._pass(passerby, data);
    }

    /// @notice Internal function to handle the gate protection (attestation check) logic.
    /// @dev Checks if the attestation matches the schema, attester, recipient, and is not revoked.
    /// @param passerby The address of the entity attempting to pass the gate.
    /// @param data Additional data required for the check (e.g., encoded attestation ID).
    function _check(address passerby, bytes calldata data) internal view override {
        super._check(passerby, data);

        bytes32 attestationId = abi.decode(data, (bytes32));

        Attestation memory attestation = EAS.getAttestation(attestationId);

        if (attestation.schema != SCHEMA) revert UnexpectedSchema();
        if (attestation.attester != ATTESTER) revert UnexpectedAttester();
        if (attestation.recipient != passerby) revert UnexpectedRecipient();
        if (attestation.revocationTime != 0) revert RevokedAttestation();
    }
}
