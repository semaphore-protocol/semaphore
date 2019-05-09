pragma solidity >=0.4.21;

contract HashTester {
    constructor() public {

    }

    event DebugHash(bytes32 normal, uint256 converted, bytes32 normal_shifted, uint256 converted_shifted);
    event DebugRollingHash(uint256 prev_rolling_hash, uint256 signal_hash, uint256 rolling_hash, bytes encoded);

    uint256 rolling_hash = 1238129381923;

    function Test(bytes memory signal) public {
        uint256 signal_hash = uint256(sha256(signal)) >> 8;
        emit DebugHash(sha256(signal), uint256(sha256(signal)), sha256(signal) >> 8, signal_hash);
        bytes memory encoded = abi.encodePacked(rolling_hash, signal_hash);
        uint256 new_rolling_hash = uint256(sha256(encoded));
        emit DebugRollingHash(rolling_hash, signal_hash, new_rolling_hash, encoded);
    }
}
