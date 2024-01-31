import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
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

            const fullProof = await generateProof(users[1], group, feedback, groupId)

            const transaction = feedbackContract.sendFeedback(
                fullProof.merkleTreeDepth,
                fullProof.merkleTreeRoot,
                fullProof.nullifier,
                feedback,
                fullProof.points
            )

            await expect(transaction)
                .to.emit(semaphoreContract, "ProofValidated")
                .withArgs(
                    groupId,
                    fullProof.merkleTreeDepth,
                    fullProof.merkleTreeRoot,
                    fullProof.nullifier,
                    fullProof.message,
                    groupId,
                    fullProof.points
                )
        })
    })
})
