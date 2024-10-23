// Remove the prepublish script from the package.json file when creating a new project using the Semaphore CLI.
export default function removePrePublishScript(packageJsonContent: string): string {
    try {
        const packageJson = JSON.parse(packageJsonContent)
        if (packageJson.scripts && "prepublish" in packageJson.scripts) {
            delete packageJson.scripts.prepublish
            if (Object.keys(packageJson.scripts).length === 0) {
                delete packageJson.scripts
            }
        }
        return JSON.stringify(packageJson, null, 2)
    } catch (error) {
        console.error("Error processing package.json:", error)
        return packageJsonContent
    }
}
