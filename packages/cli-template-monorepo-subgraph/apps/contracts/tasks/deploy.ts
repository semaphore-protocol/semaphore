import { task, types } from "hardhat/config"

task("deploy", "Deploy a Feedback contract")
    .addOptionalParam("semaphore", "Semaphore contract address", undefined, types.string)
    .addOptionalParam("group", "Group id", "42", types.string)
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs, semaphore: semaphoreAddress, group: groupId }, { ethers, run }) => {
        if (!semaphoreAddress) {
            const { semaphore } = await run("deploy:semaphore", {
                logs
            })

            semaphoreAddress = await semaphore.getAddress()
        }

        if (!groupId) {
            groupId = process.env.GROUP_ID
        }

        const FeedbackFactory = await ethers.getContractFactory("Feedback")

        const feedbackContract = await FeedbackFactory.deploy(semaphoreAddress, groupId)

        if (logs) {
            console.info(`Feedback contract has been deployed to: ${await feedbackContract.getAddress()}`)
        }

        return feedbackContract
    })
