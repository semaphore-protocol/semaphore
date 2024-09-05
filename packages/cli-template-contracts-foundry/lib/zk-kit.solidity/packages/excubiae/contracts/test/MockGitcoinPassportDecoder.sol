// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {IGitcoinPassportDecoder, Credential} from "../extensions/interfaces/IGitcoinPassportDecoder.sol";

/// @title Mock Gitcoin Passport Decoder Contract.
/// @notice This contract is a mock implementation of the IGitcoinPassportDecoder interface for testing purposes.
/// @dev It simulates a Gitcoin Passport Decoder contract providing predefined scores and credentials.
contract MockGitcoinPassportDecoder is IGitcoinPassportDecoder {
    /// @notice A mapping to store mocked scores for each user address.
    mapping(address => uint256) private mockedScores;

    /// MOCKS ///
    /// @notice Constructor to initialize the mock contract with predefined user scores.
    /// @param _users An array of user addresses.
    /// @param _scores An array of scores corresponding to the user addresses.
    constructor(address[] memory _users, uint256[] memory _scores) {
        for (uint256 i = 0; i < _users.length; i++) {
            mockedScores[_users[i]] = _scores[i];
        }
    }

    /// @notice Mock function to get the score of a user.
    /// @param user The address of the user.
    /// @return The mocked score of the user.
    function getScore(address user) external view returns (uint256) {
        return mockedScores[user];
    }

    /// @notice Mock function to check if a user is considered human based on their score.
    /// @dev check the documentation for more information about (20 is default threshold).
    /// @dev https://docs.passport.xyz/building-with-passport/smart-contracts/contract-reference#available-methods
    /// @param user The address of the user.
    /// @return True if the user's score is greater than 20, false otherwise.
    function isHuman(address user) external view returns (bool) {
        return mockedScores[user] > 20;
    }

    /// STUBS ///
    function getPassport(address /*user*/) external pure returns (Credential[] memory) {
        Credential[] memory credentials = new Credential[](1);
        credentials[0] = Credential({
            provider: "MockProvider",
            hash: keccak256("MockHash"),
            time: 1234567890123456789,
            expirationTime: 1234567890123456789 + 1 days
        });
        return credentials;
    }
}
