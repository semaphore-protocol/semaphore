import inquirer from "inquirer"

/**
 * Prompts the user to input the name of their project. Provides a default name of "my-app".
 * @returns A promise that resolves to the user's input for the project name.
 */
export async function getProjectName() {
    const { projectName } = await inquirer.prompt({
        name: "projectName",
        type: "input",
        message: "What is your project name?",
        default: "my-app"
    })
    return projectName
}

/**
 * Prompts the user to select a template from a list of supported templates. Each template is presented
 * with its value and name for better clarity.
 * @param supportedTemplates An array of objects, each containing a 'value' and 'name' property for the template.
 * @returns A promise that resolves to the selected template's value.
 */
export async function getSupportedTemplate(supportedTemplates: { value: string; name: string }[]) {
    const { selectedTemplate } = await inquirer.prompt({
        name: "selectedTemplate",
        type: "list",
        message: "Select one of the supported templates:",
        default: 0,
        choices: supportedTemplates.map((template) => ({
            value: template.value,
            name: `${template.value} (${template.name})`
        }))
    })
    return selectedTemplate
}

/**
 * Prompts the user to select a network from a list of supported networks.
 * @param supportedNetworks An array of strings representing the supported networks.
 * @returns A promise that resolves to the selected network.
 */
export async function getSupportedNetwork(supportedNetworks: string[]) {
    const { selectedNetwork } = await inquirer.prompt({
        name: "selectedNetwork",
        type: "list",
        message: "Select one of the supported networks:",
        default: 0,
        choices: supportedNetworks
    })
    return selectedNetwork
}

/**
 * Prompts the user to select a group ID from a list of existing group IDs.
 * @param groupIds An array of strings representing the group IDs.
 * @returns A promise that resolves to the selected group ID.
 */
export async function getGroupId(groupIds: string[]) {
    const { selectedGroupId } = await inquirer.prompt({
        name: "selectedGroupId",
        type: "list",
        message: "Select one of the following existing group ids:",
        default: 0,
        choices: groupIds
    })

    return selectedGroupId
}
