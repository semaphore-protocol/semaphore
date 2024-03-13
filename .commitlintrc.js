const fs = require("node:fs")
const path = require("node:path")

const packages = fs.readdirSync(path.resolve(__dirname, "packages"))

module.exports = {
    extends: ["@commitlint/config-conventional"],
    prompt: {
        scopes: [...packages],
        markBreakingChangeMode: true,
        allowCustomIssuePrefix: false,
        allowEmptyIssuePrefix: false,
        issuePrefixes: [
            {
                value: "re",
                name: "re: ISSUES related"
            }
        ]
    }
}
