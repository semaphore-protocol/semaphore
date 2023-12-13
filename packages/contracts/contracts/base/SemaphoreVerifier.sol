//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "../interfaces/ISemaphoreVerifier.sol";

/// @title Semaphore verifier contract.
/// @notice Minimal code to allow users to verify their Semaphore proofs.
/// @dev This contract allows you to verify whether a Semaphore proof is correct.
/// It is a modified version of the Groth16 verifier template of SnarkJS
/// (https://github.com/iden3/snarkjs) adapted to Semaphore. The Pairing library
/// is external.
contract SemaphoreVerifier is ISemaphoreVerifier {
    using Pairing for *;

    // prettier-ignore
    // solhint-disable-next-line
    uint256[2][7][1]  VK_POINTS = [[[1203033843370190352679536156318647846963070791761882784581562957032940878631,8079358190325697178560398569841376952804277857152452363880610878513176978414],[1709663807054049176405784021595122468175326469739885095843389206914547034049,5323102298870768887773635223311040590195621468735208775728981925050238645973],[7810627885438804854799393101615420860004300484567847086674409667961806655819,17752894058911463947056561254031971003439956976683150238952280384884265610345],[1859027844886249956101358092211425783821368393550326618436626137559481879491,21054817398797605484546956719908640544118839476669181800056403255004730797738],[15796976765804300435452771769828280808531244272386620395606681167033336150695,903968937841233929826399002238948203245370749106069849010375461873649600286],[9939447176137952809861441974771884976492003509733419789700227062163769465749,10252048733134373819769164658668132695840284406808712977431939424744406823235],[7393464059707248328549959352154443030400062088967711800345697753542770722400,7750652018971809526357985723000957185438256496025176410178561237545956517939]]];

    /// @dev See {ISemaphoreVerifier-verifyProof}.
    function verifyProof(
        uint256 merkleTreeRoot,
        uint256 nullifierHash,
        uint256 message,
        uint256 scope,
        uint256[8] calldata proof
    ) external view override {
        message = _hash(message);
        scope = _hash(scope);

        Proof memory p;

        p.A = Pairing.G1Point(proof[0], proof[1]);
        p.B = Pairing.G2Point([proof[2], proof[3]], [proof[4], proof[5]]);
        p.C = Pairing.G1Point(proof[6], proof[7]);

        // TODO: get vk dynamically based on tree depth after trusted setup.
        VerificationKey memory vk = _getVerificationKey(0);

        Pairing.G1Point memory vk_x = vk.IC[0];

        vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.IC[1], merkleTreeRoot));
        vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.IC[2], nullifierHash));
        vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.IC[3], message));
        vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.IC[4], scope));

        Pairing.G1Point[] memory p1 = new Pairing.G1Point[](4);
        Pairing.G2Point[] memory p2 = new Pairing.G2Point[](4);

        p1[0] = Pairing.negate(p.A);
        p2[0] = p.B;
        p1[1] = vk.alfa1;
        p2[1] = vk.beta2;
        p1[2] = vk_x;
        p2[2] = vk.gamma2;
        p1[3] = p.C;
        p2[3] = vk.delta2;

        Pairing.pairingCheck(p1, p2);
    }

    /// @dev Creates the verification key for a specific Merkle tree depth.
    /// @param vkPointsIndex: Index of the verification key points.
    /// @return Verification key.
    function _getVerificationKey(uint256 vkPointsIndex) private view returns (VerificationKey memory) {
        VerificationKey memory vk;

        vk.alfa1 = Pairing.G1Point(
            20491192805390485299153009773594534940189261866228447918068658471970481763042,
            9383485363053290200918347156157836566562967994039712273449902621266178545958
        );

        vk.beta2 = Pairing.G2Point(
            [
                4252822878758300859123897981450591353533073413197771768651442665752259397132,
                6375614351688725206403948262868962793625744043794305715222011528459656738731
            ],
            [
                21847035105528745403288232691147584728191162732299865338377159692350059136679,
                10505242626370262277552901082094356697409835680220590971873171140371331206856
            ]
        );

        vk.gamma2 = Pairing.G2Point(
            [
                11559732032986387107991004021392285783925812861821192530917403151452391805634,
                10857046999023057135944570762232829481370756359578518086990519993285655852781
            ],
            [
                4082367875863433681332203403145435568316851327593401208105741076214120093531,
                8495653923123431417604973247489272438418190587263600148770280649306958101930
            ]
        );

        vk.delta2 = Pairing.G2Point(VK_POINTS[vkPointsIndex][0], VK_POINTS[vkPointsIndex][1]);

        vk.IC = new Pairing.G1Point[](5);

        vk.IC[0] = Pairing.G1Point(VK_POINTS[vkPointsIndex][2][0], VK_POINTS[vkPointsIndex][2][1]);
        vk.IC[1] = Pairing.G1Point(VK_POINTS[vkPointsIndex][3][0], VK_POINTS[vkPointsIndex][3][1]);
        vk.IC[2] = Pairing.G1Point(VK_POINTS[vkPointsIndex][4][0], VK_POINTS[vkPointsIndex][4][1]);
        vk.IC[3] = Pairing.G1Point(VK_POINTS[vkPointsIndex][5][0], VK_POINTS[vkPointsIndex][5][1]);
        vk.IC[4] = Pairing.G1Point(VK_POINTS[vkPointsIndex][6][0], VK_POINTS[vkPointsIndex][6][1]);

        return vk;
    }

    /// @dev Creates a keccak256 hash of a message compatible with the SNARK scalar modulus.
    /// @param message: Message to be hashed.
    /// @return Message digest.
    function _hash(uint256 message) private pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(message))) >> 8;
    }
}
