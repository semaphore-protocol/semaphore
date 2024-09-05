// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/* solhint-disable max-line-length */
import {IEAS, ISchemaRegistry, AttestationRequest, MultiAttestationRequest, DelegatedAttestationRequest, MultiDelegatedAttestationRequest, DelegatedRevocationRequest, RevocationRequest, MultiRevocationRequest, MultiDelegatedRevocationRequest} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import {Attestation} from "@ethereum-attestation-service/eas-contracts/contracts/Common.sol";

/// @title Mock Ethereum Attestation Service (EAS) Contract.
/// @notice This contract is a mock implementation of the IEAS interface for testing purposes.
/// @dev It simulates the behavior of a real EAS contract by providing predefined mocked attestations.
contract MockEAS is IEAS {
    /// @notice A mock schema registry, represented simply as an address.
    ISchemaRegistry public override getSchemaRegistry;

    /// @notice A mapping to store mocked attestations by their unique identifiers.
    mapping(bytes32 => Attestation) private mockedAttestations;

    /// MOCKS ///
    /// @notice Constructor to initialize the mock contract with predefined attestations.
    /// @param _recipient The recipient address used in mocked attestations.
    /// @param _attester The attester address used in mocked attestations.
    /// @param _schema The schema identifier used in mocked attestations.
    constructor(address _recipient, address _attester, bytes32 _schema) {
        getSchemaRegistry = ISchemaRegistry(address(1));

        Attestation memory valid = Attestation({
            uid: bytes32(hex"0100000000000000000000000000000000000000000000000000000000000000"),
            schema: _schema,
            time: 0,
            expirationTime: 0,
            revocationTime: 0,
            refUID: bytes32(hex"0100000000000000000000000000000000000000000000000000000000000000"),
            recipient: _recipient,
            attester: _attester,
            revocable: true,
            data: bytes("")
        });

        Attestation memory revoked = Attestation({
            uid: bytes32(hex"0200000000000000000000000000000000000000000000000000000000000000"),
            schema: _schema,
            time: 0,
            expirationTime: 0,
            revocationTime: 1,
            refUID: bytes32(hex"0100000000000000000000000000000000000000000000000000000000000000"),
            recipient: _recipient,
            attester: _attester,
            revocable: true,
            data: bytes("")
        });

        Attestation memory invalidSchema = Attestation({
            uid: bytes32(hex"0300000000000000000000000000000000000000000000000000000000000000"),
            schema: bytes32(hex"0100000000000000000000000000000000000000000000000000000000000000"),
            time: 0,
            expirationTime: 0,
            revocationTime: 0,
            refUID: bytes32(hex"0100000000000000000000000000000000000000000000000000000000000000"),
            recipient: _recipient,
            attester: _attester,
            revocable: true,
            data: bytes("")
        });

        Attestation memory invalidRecipient = Attestation({
            uid: bytes32(hex"0400000000000000000000000000000000000000000000000000000000000000"),
            schema: _schema,
            time: 0,
            expirationTime: 0,
            revocationTime: 0,
            refUID: bytes32(hex"0100000000000000000000000000000000000000000000000000000000000000"),
            recipient: address(1),
            attester: _attester,
            revocable: true,
            data: bytes("")
        });

        Attestation memory invalidAttester = Attestation({
            uid: bytes32(hex"0500000000000000000000000000000000000000000000000000000000000000"),
            schema: _schema,
            time: 0,
            expirationTime: 0,
            revocationTime: 0,
            refUID: bytes32(hex"0100000000000000000000000000000000000000000000000000000000000000"),
            recipient: _recipient,
            attester: address(1),
            revocable: true,
            data: bytes("")
        });

        mockedAttestations[bytes32(hex"0100000000000000000000000000000000000000000000000000000000000000")] = valid;
        mockedAttestations[bytes32(hex"0200000000000000000000000000000000000000000000000000000000000000")] = revoked;
        mockedAttestations[
            bytes32(hex"0300000000000000000000000000000000000000000000000000000000000000")
        ] = invalidSchema;
        mockedAttestations[
            bytes32(hex"0400000000000000000000000000000000000000000000000000000000000000")
        ] = invalidRecipient;
        mockedAttestations[
            bytes32(hex"0500000000000000000000000000000000000000000000000000000000000000")
        ] = invalidAttester;
    }

    /// @notice Retrieves a mocked attestation by its unique identifier.
    /// @param uid The unique identifier of the attestation.
    /// @return The mocked attestation associated with the given identifier.
    function getAttestation(bytes32 uid) external view override returns (Attestation memory) {
        return mockedAttestations[uid];
    }

    /// STUBS ///
    // The following functions are stubs and do not perform any meaningful operations.
    // They are placeholders to comply with the IEAS interface.
    function attest(AttestationRequest calldata /*request*/) external payable override returns (bytes32) {
        return bytes32(0);
    }

    function attestByDelegation(
        DelegatedAttestationRequest calldata /*delegatedRequest*/
    ) external payable override returns (bytes32) {
        return bytes32(0);
    }

    function multiAttest(
        MultiAttestationRequest[] calldata multiRequests
    ) external payable override returns (bytes32[] memory) {
        return new bytes32[](multiRequests.length);
    }

    function multiAttestByDelegation(
        MultiDelegatedAttestationRequest[] calldata multiDelegatedRequests
    ) external payable override returns (bytes32[] memory) {
        return new bytes32[](multiDelegatedRequests.length);
    }

    function revoke(RevocationRequest calldata request) external payable override {}

    function revokeByDelegation(DelegatedRevocationRequest calldata delegatedRequest) external payable override {}

    function multiRevoke(MultiRevocationRequest[] calldata multiRequests) external payable override {}

    function multiRevokeByDelegation(
        MultiDelegatedRevocationRequest[] calldata multiDelegatedRequests
    ) external payable override {}

    function timestamp(bytes32 /*data*/) external view override returns (uint64) {
        return uint64(block.timestamp);
    }

    function multiTimestamp(bytes32[] calldata /*data*/) external view override returns (uint64) {
        return uint64(block.timestamp);
    }

    function revokeOffchain(bytes32 /*data*/) external view override returns (uint64) {
        return uint64(block.timestamp);
    }

    function multiRevokeOffchain(bytes32[] calldata /*data*/) external view override returns (uint64) {
        return uint64(block.timestamp);
    }

    function isAttestationValid(bytes32 uid) external view override returns (bool) {
        return mockedAttestations[uid].uid != bytes32(0);
    }

    function getTimestamp(bytes32 /*data*/) external view override returns (uint64) {
        return uint64(block.timestamp);
    }

    function getRevokeOffchain(address /*revoker*/, bytes32 /*data*/) external view override returns (uint64) {
        return uint64(block.timestamp);
    }

    function version() external pure returns (string memory) {
        return string("");
    }
}
