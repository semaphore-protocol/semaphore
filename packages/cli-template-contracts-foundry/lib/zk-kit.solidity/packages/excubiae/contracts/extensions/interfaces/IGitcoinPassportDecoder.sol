// SPDX-License-Identifier: GPL
pragma solidity >=0.8.0;

/// This interface has been copied & pasted from
/// https://github.com/gitcoinco/eas-proxy/blob/main/contracts/IGitcoinPassportDecoder.sol
/// with commit hash d82a73337216effdba719a625f92cb941b537850.

/**
 * @dev A struct storing a passpor credential
 */

struct Credential {
    string provider;
    bytes32 hash;
    uint64 time;
    uint64 expirationTime;
}

/**
 * @title IGitcoinPassportDecoder
 * @notice Minimal interface for consuming GitcoinPassportDecoder data
 */
interface IGitcoinPassportDecoder {
    function getPassport(address user) external returns (Credential[] memory);

    function getScore(address user) external view returns (uint256);

    function isHuman(address user) external view returns (bool);
}
