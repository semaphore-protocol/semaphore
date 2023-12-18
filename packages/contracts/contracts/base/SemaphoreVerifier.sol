// SPDX-License-Identifier: GPL-3.0
/*
    Copyright 2021 0KIMS association.

    This file is generated with [snarkJS](https://github.com/iden3/snarkjs).

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

pragma solidity 0.8.4;

contract SemaphoreVerifier {
    // Scalar field size
    uint256 public constant r = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 public constant q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 public constant alphax = 20491192805390485299153009773594534940189261866228447918068658471970481763042;
    uint256 public constant alphay = 9383485363053290200918347156157836566562967994039712273449902621266178545958;

    uint256 public constant betax1 = 4252822878758300859123897981450591353533073413197771768651442665752259397132;
    uint256 public constant betax2 = 6375614351688725206403948262868962793625744043794305715222011528459656738731;

    uint256 public constant betay1 = 21847035105528745403288232691147584728191162732299865338377159692350059136679;
    uint256 public constant betay2 = 10505242626370262277552901082094356697409835680220590971873171140371331206856;

    uint256 public constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 public constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;

    uint256 public constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 public constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;

    uint256 public constant deltax1 = 4802212656094790438590349860247775075786991105131547807727284652635601493451;
    uint256 public constant deltax2 = 3192001579163161965737706068451660722884189926734050314177195054150514444526;

    uint256 public constant deltay1 = 15972350841447731019470651411783473840114797777894828544121644904018624203926;
    uint256 public constant deltay2 = 16736984041748862942817824193402022794140982482563484226161429255394796148810;

    uint256 public constant IC0x = 7810627885438804854799393101615420860004300484567847086674409667961806655819;
    uint256 public constant IC0y = 17752894058911463947056561254031971003439956976683150238952280384884265610345;

    uint256 public constant IC1x = 1859027844886249956101358092211425783821368393550326618436626137559481879491;
    uint256 public constant IC1y = 21054817398797605484546956719908640544118839476669181800056403255004730797738;

    uint256 public constant IC2x = 15796976765804300435452771769828280808531244272386620395606681167033336150695;
    uint256 public constant IC2y = 903968937841233929826399002238948203245370749106069849010375461873649600286;

    uint256 public constant IC3x = 9939447176137952809861441974771884976492003509733419789700227062163769465749;
    uint256 public constant IC3y = 10252048733134373819769164658668132695840284406808712977431939424744406823235;

    uint256 public constant IC4x = 7393464059707248328549959352154443030400062088967711800345697753542770722400;
    uint256 public constant IC4y = 7750652018971809526357985723000957185438256496025176410178561237545956517939;

    // Memory data
    uint16 public constant pVk = 0;
    uint16 public constant pPairing = 128;

    uint16 public constant pLastMem = 896;

    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[4] calldata _pubSignals
    ) external view returns (bool) {
        assembly {
            function checkField(v) {
                if iszero(lt(v, q)) {
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

                success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, IC0x)
                mstore(add(_pVk, 32), IC0y)

                // Compute the linear combination vk_x

                g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))

                g1_mulAccC(_pVk, IC2x, IC2y, calldataload(add(pubSignals, 32)))

                g1_mulAccC(_pVk, IC3x, IC3y, calldataload(add(pubSignals, 64)))

                g1_mulAccC(_pVk, IC4x, IC4y, calldataload(add(pubSignals, 96)))

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
                mstore(add(_pPairing, 640), deltax1)
                mstore(add(_pPairing, 672), deltax2)
                mstore(add(_pPairing, 704), deltay1)
                mstore(add(_pPairing, 736), deltay2)

                let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)

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
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
            return(0, 0x20)
        }
    }
}
