import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import virtual from "@rollup/plugin-virtual"
import * as fs from "fs"
import cleanup from "rollup-plugin-cleanup"
import typescript from "rollup-plugin-typescript2"

// Needed by fastfile.
import { O_CREAT, O_EXCL, O_RDONLY, O_RDWR, O_TRUNC } from "constants"

const constants = `
export const O_TRUNC = ${O_TRUNC};
export const O_CREAT = ${O_CREAT};
export const O_RDWR = ${O_RDWR};
export const O_EXCL = ${O_EXCL};
export const O_RDONLY = ${O_RDONLY}
`

const empty = "export default {}"

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"))
const banner = `/**
 * @module ${pkg.name}
 * @version ${pkg.version}
 * @file ${pkg.description}
 * @copyright Ethereum Foundation 2022
 * @license ${pkg.license}
 * @see [Github]{@link ${pkg.homepage}}
*/`

export default {
    input: "src/index.ts",
    output: [
        {
            file: pkg.exports.browser,
            format: "es",
            banner
        }
    ],
    external: Object.keys(pkg.dependencies),
    plugins: [
        typescript({
            tsconfig: "./build.tsconfig.json",
            useTsconfigDeclarationDir: true
        }),
        virtual({
            fs: empty,
            constants
        }),
        nodeResolve(),
        commonjs({
            esmExternals: true
        }),
        cleanup({ comments: "jsdoc" }),
        json()
    ]
}
