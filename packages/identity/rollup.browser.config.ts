import alias from "@rollup/plugin-alias"
import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import * as fs from "fs"
import cleanup from "rollup-plugin-cleanup"

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"))
const banner = `/**
 * @module ${pkg.name}
 * @version ${pkg.version}
 * @file ${pkg.description}
 * @copyright Ethereum Foundation ${new Date().getFullYear()}
 * @license ${pkg.license}
 * @see [Github]{@link ${pkg.homepage}}
*/`

export default {
    input: "src/index.ts",
    output: [
        {
            file: pkg.exports["."].browser,
            format: "es",
            banner
        }
    ],
    external: pkg.dependencies,
    plugins: [
        alias({
            entries: [{ find: "./random-number.node", replacement: "./random-number.browser" }]
        }),
        typescript({
            tsconfig: "./build.tsconfig.json"
        }),
        commonjs(),
        nodeResolve(),
        cleanup({ comments: "jsdoc" }),
        json()
    ]
}
