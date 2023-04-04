import inquirer from "inquirer"

export async function getProjectName() {
    const { projectName } = await inquirer.prompt({
        name: "projectName",
        type: "input",
        message: "What is your project name?",
        default: "my-app"
    })
    return projectName
}

export async function getSupportedTemplate(supportedTemplates: string[]) {
    const { selectedTemplate } = await inquirer.prompt({
        name: "selectedTemplate",
        type: "list",
        message: "Select one of the supported templates:",
        default: supportedTemplates[0],
        choices: supportedTemplates
    })
    return selectedTemplate
}

export async function getSupportedNetwork(supportedNetworks: string[]) {
    const { selectedNetwork } = await inquirer.prompt({
        name: "selectedNetwork",
        type: "list",
        message: "Select one of the supported networks:",
        default: supportedNetworks[0],
        choices: supportedNetworks
    })
    return selectedNetwork
}

export async function getGroupId(groupIds: string[]) {
    const { selectedGroupId } = await inquirer.prompt({
        name: "selectedGroupId",
        type: "list",
        message: "Select one of the following existing group ids:",
        choices: groupIds
    })

    return selectedGroupId
}
