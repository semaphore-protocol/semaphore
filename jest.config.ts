import fs from "fs"
import type { Config } from "jest"

const exclude = ["circuits", "contracts"]

const projects = fs
    .readdirSync("./packages", { withFileTypes: true })
    .filter((directory) => directory.isDirectory())
    .filter((directory) => !exclude.includes(directory.name))
    .map(({ name }) => ({
        preset: "ts-jest",
        rootDir: `packages/${name}`,
        displayName: name,
        setupFiles: ["dotenv/config"],
        moduleNameMapper: {
            "@semaphore-protocol/(.*)/(.*)": "<rootDir>/../$1/src/$2",
            "@semaphore-protocol/(.*)": "<rootDir>/../$1/src"
        }
    }))

const config: Config = {
    projects,
    verbose: true,
    coverageDirectory: "./coverage/libraries",
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 95,
            lines: 95,
            statements: 95
        }
    }
}

export default config
