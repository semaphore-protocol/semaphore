import { execa } from "execa"

async function main() {
    const version = process.argv[2]

    if (!version) {
        console.error("Version number is required.")
        process.exit(1)
    }

    try {
        // Perform the workspaces version update
        await execa("yarn", ["workspaces", "foreach", "-A", "--no-private", "version", "-d", version], {
            stdio: "inherit"
        })

        // Apply the versions
        await execa("yarn", ["version", "apply", "--all"], { stdio: "inherit" })

        await import("./remove-stable-version-field")
        await execa("yarn", ["format:write"])
        await execa("git", ["commit", "-am", `chore: v${version}`], {
            env: { ...process.env, NO_HOOK: "1" },
            stdio: "inherit"
        })

        await execa("git", ["tag", `v${version}`], { stdio: "inherit" })

        console.log("Versioning script completed successfully.")
    } catch (error) {
        console.error("An error occurred:", error)
        process.exit(1)
    }
}

main()
