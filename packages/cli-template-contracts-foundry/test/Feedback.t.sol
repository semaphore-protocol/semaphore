// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test} from "forge-std/Test.sol";
import {ISemaphore} from "@semaphore/contracts/interfaces/ISemaphore.sol";
import {ISemaphoreGroups} from "@semaphore/contracts/interfaces/ISemaphoreGroups.sol";
import {Feedback} from "../src/Feedback.sol";
import {DeployFeedback} from "../script/DeployFeedback.s.sol";
import {console} from "forge-std/Script.sol";

contract FeedbackTest is Test {
    event MemberAdded(uint256 indexed groupId, uint256 index, uint256 identityCommitment, uint256 merkleTreeRoot);

    Feedback internal feedbackContract;
    ISemaphore internal semaphoreContract;
    ISemaphoreGroups internal semaphoreGroups;
    uint256 internal groupId;

    function setUp() external {
        DeployFeedback deployFeedback = new DeployFeedback();
        (address feedbackAddress, address semaphoreAddress) = deployFeedback.run();
        feedbackContract = Feedback(feedbackAddress);
        semaphoreContract = ISemaphore(semaphoreAddress);
        semaphoreGroups = ISemaphoreGroups(semaphoreAddress);
        groupId = feedbackContract.groupId();
    }

    function test_groupCreatedInConstructor() public view {
        uint256 groupCount = semaphoreContract.groupCounter();
        assertEq(groupCount, 1);
    }

    function test_joinGroup() public {
        // The commitment below is generated with private key of the first account in Anvil
        uint256 identityCommitment = 15072455385723004728391568434269917452175057560864330595979104241296826134229;

        // Test: expect an event emitted. Check for all event topics and data
        vm.expectEmit(true, true, true, true);
        emit MemberAdded(groupId, 0, identityCommitment, identityCommitment);

        feedbackContract.joinGroup(identityCommitment);
    }

    function test_sendFeedback() public {
        uint256[] memory commitments = new uint256[](2);
        commitments[0] = uint256(
            18_699_903_263_915_756_199_535_533_399_390_350_858_126_023_699_350_081_471_896_734_858_638_858_200_219
        );
        commitments[1] = uint256(
            4_446_973_358_529_698_253_939_037_684_201_229_393_105_675_634_248_270_727_935_122_282_482_202_195_132
        );

        for (uint256 i = 0; i < commitments.length; ++i) {
            feedbackContract.joinGroup(commitments[i]);
        }

        uint256 merkleTreeDepth = 2;
        uint256 merkleTreeRoot = semaphoreGroups.getMerkleTreeRoot(groupId);
        uint256 feedback = uint256(bytes32("Hello World"));

        // These values are computed by running through @semaphore-protocol/circuits
        uint256 nullifier = 19686122779422310562166284157356225273555811832250923548604308577995736533741;
        uint256[8] memory points = [
            12048312860461559338883155239253399933546666729690013703471566999549175452467,
            21840091385609522690103928000869734241136862303146585471149748945500784854265,
            10054166788431277732934266072748176286083365382773741957806739135617485223542,
            9116054769380232069869558420495933708797671282085269461846220481242548419978,
            6948551756635965397908570768367265912884504926499199123083878377204200654789,
            2245690128809758381379719477871572712156305432595569015554741897717367802975,
            5611601698470220983640634359607737788561497874240905720723835997666161640377,
            10003362076211645361201917446734540672642362716488164733173444779942043660944
        ];

        vm.expectEmit(true, true, true, true);
        emit ISemaphore.ProofValidated(
            groupId,
            merkleTreeDepth,
            merkleTreeRoot,
            nullifier,
            feedback,
            groupId,
            points
        );

        feedbackContract.sendFeedback(merkleTreeDepth, merkleTreeRoot, nullifier, feedback, points);
    }
}
