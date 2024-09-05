const fs = require("node:fs")
const path = require("node:path")

const packages = fs.readdirSync(path.resolve(__dirname, "packages"))
const apps = fs.readdirSync(path.resolve(__dirname, "apps"))

module.exports = {
    extends: ["@commitlint/config-conventional"],
    prompt: {
        scopes: [...packages, ...apps],
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
