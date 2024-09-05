// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Mock ERC721 Token Contract.
/// @notice This contract is a mock implementation of the ERC721 standard for testing purposes.
/// @dev It simulates the behavior of a real ERC721 contract by providing basic minting functionality.
contract MockERC721 is ERC721, Ownable(msg.sender) {
    /// @notice A counter to keep track of the token IDs.
    uint256 private _tokenIdCounter;

    /// @notice Constructor to initialize the mock contract with a name and symbol.
    constructor() payable ERC721("MockERC721Token", "MockERC721Token") {}

    /// @notice Mints a new token and assigns it to the specified recipient.
    /// @param recipient The address that will receive the minted token.
    function mintAndGiveToken(address recipient) public onlyOwner {
        _safeMint(recipient, _tokenIdCounter++);
    }
}
