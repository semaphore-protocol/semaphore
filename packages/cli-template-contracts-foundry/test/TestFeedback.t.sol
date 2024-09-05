// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Feedback} from "../src/Feedback.sol";
import {DeployFeedback} from "../script/DeployFeedback.s.sol";
import {ISemaphore} from "@semaphore/contracts/contracts/interfaces/ISemaphore.sol";
import "forge-std/Test.sol";
import "forge-std/Vm.sol";
import "forge-std/StdAssertions.sol"; 
contract TestFeedback is Test {
    event MemberAdded(uint256 indexed groupId, uint256 index, uint256 identityCommitment, uint256 merkleTreeRoot);

    Feedback feedback;
    ISemaphore semaphore;

    function setUp() external {
        DeployFeedback deployFeedback = new DeployFeedback();
        (address feedbackAddress, address semaphoreAddress) = deployFeedback.run();
        feedback = Feedback(feedbackAddress);
        semaphore = ISemaphore(semaphoreAddress);
    }


    function testCreatGroup() public view {
        uint256 groupCount = semaphore.groupCounter();
        assertEq(groupCount, 1);
    }

    function testJoinGroup() public {
        uint256 identityCommitment = 15072455385723004728391568434269917452175057560864330595979104241296826134229;
        vm.expectEmit();
        emit MemberAdded(0, 0, identityCommitment, identityCommitment);
        feedback.joinGroup(identityCommitment);
    }

    function testSendFeedback() public {
        uint256 identityCommitment = 15072455385723004728391568434269917452175057560864330595979104241296826134229;
        uint256 merkleTreeDepth = 1;
        uint256 merkleTreeRoot = 15072455385723004728391568434269917452175057560864330595979104241296826134229;
        uint256 nullifier = 19686122779422310562166284157356225273555811832250923548604308577995736533741;
        uint256 _feedback = 10;
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

        feedback.joinGroup(identityCommitment);
        feedback.sendFeedback(merkleTreeDepth, merkleTreeRoot, nullifier, _feedback, points);
    }

}