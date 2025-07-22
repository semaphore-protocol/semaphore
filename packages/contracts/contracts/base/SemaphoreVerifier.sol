// SPDX-License-Identifier: MIT
// Part of this file was generated with [snarkJS](https://github.com/iden3/snarkjs).

pragma solidity >=0.8.23 <0.9.0;

import {MAX_DEPTH} from "./Constants.sol";
import {SemaphoreVerifierKeyPts} from "./SemaphoreVerifierKeyPts.sol";

contract SemaphoreVerifier {
    // Scalar field size
    uint256 constant r = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 constant q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 constant alphax = 16428432848801857252194528405604668803277877773566238944394625302971855135431;
    uint256 constant alphay = 16846502678714586896801519656441059708016666274385668027902869494772365009666;
    uint256 constant betax1 = 3182164110458002340215786955198810119980427837186618912744689678939861918171;
    uint256 constant betax2 = 16348171800823588416173124589066524623406261996681292662100840445103873053252;
    uint256 constant betay1 = 4920802715848186258981584729175884379674325733638798907835771393452862684714;
    uint256 constant betay2 = 19687132236965066906216944365591810874384658708175106803089633851114028275753;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;

    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    constructor() {
        SemaphoreVerifierKeyPts.checkInvariant(MAX_DEPTH);
    }

    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[4] calldata _pubSignals,
        uint merkleTreeDepth
    ) external view returns (bool) {
        uint[14] memory _vkPoints = SemaphoreVerifierKeyPts.getPts(merkleTreeDepth);

        assembly {
            function checkField(v) {
                if iszero(lt(v, r)) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            // G1 function to multiply a G1 value(x,y) to value in an address
            function g1_mulAccC(pR, x, y, s) {
                let success
                let mIn := mload(0x40)
                mstore(mIn, x)
                mstore(add(mIn, 32), y)
                mstore(add(mIn, 64), s)

                // ecMul gas cost is fixed at 6000. Add 33.3% gas for safety buffer.
                // Last checked in 2024 Oct, evm codename Cancun
                // ref: https://www.evm.codes/precompiled?fork=cancun#0x07
                success := staticcall(8000, 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                // ecAdd gas cost is fixed at 150. Add 33.3% gas for safety buffer.
                // Last checked in 2024 Oct, evm codename Cancun
                // ref: https://www.evm.codes/precompiled?fork=cancun#0x06
                success := staticcall(200, 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem, vkPoints) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, mload(add(vkPoints, 128)))
                mstore(add(_pVk, 32), mload(add(vkPoints, 160)))

                // Compute the linear combination vk_x

                g1_mulAccC(_pVk, mload(add(vkPoints, 192)), mload(add(vkPoints, 224)), calldataload(add(pubSignals, 0)))

                g1_mulAccC(
                    _pVk,
                    mload(add(vkPoints, 256)),
                    mload(add(vkPoints, 288)),
                    calldataload(add(pubSignals, 32))
                )

                g1_mulAccC(
                    _pVk,
                    mload(add(vkPoints, 320)),
                    mload(add(vkPoints, 352)),
                    calldataload(add(pubSignals, 64))
                )

                g1_mulAccC(
                    _pVk,
                    mload(add(vkPoints, 384)),
                    mload(add(vkPoints, 416)),
                    calldataload(add(pubSignals, 96))
                )

                // -A
                mstore(_pPairing, calldataload(pA))
                mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

                // B
                mstore(add(_pPairing, 64), calldataload(pB))
                mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
                mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
                mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

                // alpha1
                mstore(add(_pPairing, 192), alphax)
                mstore(add(_pPairing, 224), alphay)

                // beta2
                mstore(add(_pPairing, 256), betax1)
                mstore(add(_pPairing, 288), betax2)
                mstore(add(_pPairing, 320), betay1)
                mstore(add(_pPairing, 352), betay2)

                // vk_x
                mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
                mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))

                // gamma2
                mstore(add(_pPairing, 448), gammax1)
                mstore(add(_pPairing, 480), gammax2)
                mstore(add(_pPairing, 512), gammay1)
                mstore(add(_pPairing, 544), gammay2)

                // C
                mstore(add(_pPairing, 576), calldataload(pC))
                mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

                // delta2
                mstore(add(_pPairing, 640), mload(vkPoints))
                mstore(add(_pPairing, 672), mload(add(vkPoints, 32)))
                mstore(add(_pPairing, 704), mload(add(vkPoints, 64)))
                mstore(add(_pPairing, 736), mload(add(vkPoints, 96)))

                // ecPairing gas cost at 181000 given 768 bytes input. Add 33.3% gas for safety buffer.
                // Last checked in 2024 Oct, evm codename Cancun
                // ref: https://www.evm.codes/precompiled?fork=cancun#0x08
                let success := staticcall(241333, 8, _pPairing, 768, _pPairing, 0x20)

                isOk := and(success, mload(_pPairing))
            }

            let pMem := mload(0x40)
            mstore(0x40, add(pMem, pLastMem))

            // Validate that all evaluations ∈ F

            checkField(calldataload(add(_pubSignals, 0)))

            checkField(calldataload(add(_pubSignals, 32)))

            checkField(calldataload(add(_pubSignals, 64)))

            checkField(calldataload(add(_pubSignals, 96)))

            checkField(calldataload(add(_pubSignals, 128)))

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem, _vkPoints)

            mstore(0, isValid)
            return(0, 0x20)
        }
    }
}
