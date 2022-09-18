import fs from "fs"
import type { Config } from "@jest/types"

const projects: any = fs
    .readdirSync("./packages", { withFileTypes: true })
    .filter((directory) => directory.isDirectory())
    .map(({ name }) => ({
        rootDir: `packages/${name}`,
        displayName: name,
        setupFiles: ["dotenv/config"],
        moduleNameMapper: {
            "@semaphore-protocol/(.*)": "<rootDir>/../$1/src/index.ts" // Interdependency packages.
        }
    }))

export default async (): Promise<Config.InitialOptions> => ({
    projects,
    verbose: true,
    coverageDirectory: "./coverage/libraries",
    collectCoverageFrom: ["<rootDir>/src/**/*.ts", "!<rootDir>/src/**/index.ts", "!<rootDir>/src/**/*.d.ts"],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 95,
            lines: 95,
            statements: 95
        }
    }
})
