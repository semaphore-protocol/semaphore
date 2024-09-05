// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {Excubia} from "../Excubia.sol";
import {IERC721} from "@openzeppelin/contracts/interfaces/IERC721.sol";

/// @title ERC721 Excubia Contract.
/// @notice This contract extends the Excubia contract to integrate with an ERC721 token.
/// This contract checks the ownership of an ERC721 token to permit access through the gate.
/// @dev The contract refers to a contract implementing the ERC721 standard to admit the owner of the token.
contract ERC721Excubia is Excubia {
    /// @notice The ERC721 token contract interface.
    IERC721 public immutable NFT;

    /// @notice Mapping to track which token IDs have passed by the gate to
    /// avoid passing the gate twice with the same token ID.
    mapping(uint256 => bool) public passedTokenIds;

    /// @notice Error thrown when the passerby is not the owner of the token.
    error UnexpectedTokenOwner();

    /// @notice Constructor to initialize with target ERC721 contract.
    /// @param _erc721 The address of the ERC721 contract.
    constructor(address _erc721) {
        if (_erc721 == address(0)) revert ZeroAddress();

        NFT = IERC721(_erc721);
    }

    /// @notice The trait of the Excubia contract.
    function trait() external pure override returns (string memory) {
        return "ERC721";
    }

    /// @notice Internal function to handle the passing logic with check.
    /// @dev Calls the parent `_pass` function and stores the NFT ID to avoid passing the gate twice.
    /// @param passerby The address of the entity attempting to pass the gate.
    /// @param data Additional data required for the check (e.g., encoded token ID).
    function _pass(address passerby, bytes calldata data) internal override {
        uint256 tokenId = abi.decode(data, (uint256));

        // Avoiding passing the gate twice with the same token ID.
        if (passedTokenIds[tokenId]) revert AlreadyPassed();

        passedTokenIds[tokenId] = true;

        super._pass(passerby, data);
    }

    /// @notice Internal function to handle the gate protection (token ownership check) logic.
    /// @dev Checks if the passerby is the owner of the token.
    /// @param passerby The address of the entity attempting to pass the gate.
    /// @param data Additional data required for the check (e.g., encoded token ID).
    function _check(address passerby, bytes calldata data) internal view override {
        super._check(passerby, data);

        uint256 tokenId = abi.decode(data, (uint256));

        // Check if the user owns the token.
        if (!(NFT.ownerOf(tokenId) == passerby)) revert UnexpectedTokenOwner();
    }
}
