// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test} from "forge-std/Test.sol";
import {ISemaphore} from "@semaphore/contracts/interfaces/ISemaphore.sol";
import {ISemaphoreGroups} from "@semaphore/contracts/interfaces/ISemaphoreGroups.sol";
import {Feedback} from "../src/Feedback.sol";
import {DeployFeedback} from "../script/DeployFeedback.s.sol";

contract FeedbackTest is Test {
    event MemberAdded(uint256 indexed groupId, uint256 index, uint256 identityCommitment, uint256 merkleTreeRoot);

    Feedback internal feedbackContract;
    ISemaphore internal semaphoreContract;
    ISemaphoreGroups internal semaphoreGroups;
    uint256 internal groupId;

    function setUp() external {
        DeployFeedback deployFeedback = new DeployFeedback();
        (address feedbackAddress, address semaphoreAddress, ) = deployFeedback.run();
        feedbackContract = Feedback(feedbackAddress);
        semaphoreContract = ISemaphore(semaphoreAddress);
        semaphoreGroups = ISemaphoreGroups(semaphoreAddress);
        groupId = feedbackContract.groupId();
    }

    function testGroupCreatedInConstructor() public view {
        uint256 groupCount = semaphoreContract.groupCounter();
        assertEq(groupCount, 1);
    }

    function testJoinGroup() public {
        // The commitment below is generated with private key of the first account in Anvil
        uint256 identityCommitment = 15072455385723004728391568434269917452175057560864330595979104241296826134229;

        // Test: expect an event emitted. Check for all event topics and data
        vm.expectEmit(true, true, true, true);
        emit MemberAdded(groupId, 0, identityCommitment, identityCommitment);

        feedbackContract.joinGroup(identityCommitment);
    }

    function testSendFeedback() public {
        uint256[] memory commitments = new uint256[](2);
        commitments[0] = uint256(11005642493773047649202648265396872197147567800455247120861783398111750817516);
        commitments[1] = uint256(14473821761500463903284857947161896352613497175238126022206384102438097355186);

        for (uint256 i = 0; i < commitments.length; ++i) {
            feedbackContract.joinGroup(commitments[i]);
        }

        uint256 merkleTreeDepth = 1;
        uint256 merkleTreeRoot = semaphoreGroups.getMerkleTreeRoot(groupId);
        uint256 feedback = uint256(bytes32("Hello World"));

        // These values are computed by running through @semaphore-protocol/circuits
        uint256 nullifier = 14622092170088252518938850323258916742048811914834592843410744760450844885096;
        uint256[8] memory points = [
            2004484873491928515306456072357737929124240734208600886081152392890959117520,
            21291026142870585364296731900941597996672838511394659364623185352043543529323,
            4657264777014371046112557309523098953851041383509685591373847255581509612788,
            6904165961903336246592681066375875983213983935764940579845010085396463328555,
            1952750241178995674697344628236393389729638396609772141225880353616301956443,
            106937615136633409337870509099767689510837462832227699340906789167349502398,
            13080722838047436988558418790480431472161933638137155324683844808531903905810,
            2547578906197450986657523555784319153413167960139250957065929818900731634820
        ];

        vm.expectEmit(true, true, true, true);
        emit ISemaphore.ProofValidated(groupId, merkleTreeDepth, merkleTreeRoot, nullifier, feedback, groupId, points);

        feedbackContract.sendFeedback(merkleTreeDepth, merkleTreeRoot, nullifier, feedback, points);
    }
}
