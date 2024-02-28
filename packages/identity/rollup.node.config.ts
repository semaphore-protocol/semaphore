import commonjs from "@rollup/plugin-commonjs"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import * as fs from "fs"
import cleanup from "rollup-plugin-cleanup"
import typescript from "rollup-plugin-typescript2"

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"))
const banner = `/**
 * @module ${pkg.name}
 * @version ${pkg.version}
 * @file ${pkg.description}
 * @copyright Ethereum Foundation 2024
 * @license ${pkg.license}
 * @see [Github]{@link ${pkg.homepage}}
*/`

export default {
    input: "src/index.ts",
    output: [
        { file: pkg.exports["."].node.require, format: "cjs", banner, exports: "auto" },
        { file: pkg.exports["."].node.default, format: "es", banner }
    ],
    external: [...Object.keys(pkg.dependencies), "node:crypto"],
    plugins: [
        typescript({
            tsconfig: "./build.tsconfig.json",
            useTsconfigDeclarationDir: true
        }),
        commonjs(),
        nodeResolve(),
        cleanup({ comments: "jsdoc" })
    ]
}
