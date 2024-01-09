import typescript from "rollup-plugin-typescript2"
import commonjs from "@rollup/plugin-commonjs"
import * as fs from "fs"
import cleanup from "rollup-plugin-cleanup"
import { nodeResolve } from "@rollup/plugin-node-resolve"

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
        { file: pkg.exports.require, format: "cjs", banner, exports: "auto" },
        { file: pkg.exports.import, format: "es", banner }
    ],
    external: Object.keys(pkg.dependencies),
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
