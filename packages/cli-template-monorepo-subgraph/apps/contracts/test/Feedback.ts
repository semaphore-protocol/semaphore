import { Group, Identity, generateProof } from "@semaphore-protocol/core"
import { expect } from "chai"
import { encodeBytes32String } from "ethers"
import { run } from "hardhat"
// @ts-ignore: typechain folder will be generated after contracts compilation
import { Feedback } from "../typechain-types"

describe("Feedback", () => {
    let feedbackContract: Feedback
    let semaphoreContract: string

    const groupId = "42"
    const group = new Group()
    const users: Identity[] = []

    before(async () => {
        const { semaphore } = await run("deploy:semaphore", {
            logs: false
        })

        feedbackContract = await run("deploy", { logs: false, group: groupId, semaphore: await semaphore.getAddress() })
        semaphoreContract = semaphore

        users.push(new Identity())
        users.push(new Identity())
    })

    describe("# joinGroup", () => {
        it("Should allow users to join the group", async () => {
            for await (const [i, user] of users.entries()) {
                const transaction = feedbackContract.joinGroup(user.commitment)

                group.addMember(user.commitment)

                await expect(transaction)
                    .to.emit(semaphoreContract, "MemberAdded")
                    .withArgs(groupId, i, user.commitment, group.root)
            }
        })
    })

    describe("# sendFeedback", () => {
        it("Should allow users to send feedback anonymously", async () => {
            const feedback = encodeBytes32String("Hello World")

            const proof = await generateProof(users[1], group, feedback, groupId)

            const transaction = feedbackContract.sendFeedback(
                proof.merkleTreeDepth,
                proof.merkleTreeRoot,
                proof.nullifier,
                feedback,
                proof.points
            )

            await expect(transaction)
                .to.emit(semaphoreContract, "ProofValidated")
                .withArgs(
                    groupId,
                    proof.merkleTreeDepth,
                    proof.merkleTreeRoot,
                    proof.nullifier,
                    proof.message,
                    groupId,
                    proof.points
                )
        })
    })
})
