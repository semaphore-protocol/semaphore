import alias from "@rollup/plugin-alias"
import json from "@rollup/plugin-json"
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
        {
            file: pkg.exports.browser,
            format: "es",
            banner
        }
    ],
    external: [...Object.keys(pkg.dependencies), "poseidon-lite/poseidon2"],
    plugins: [
        alias({
            entries: [{ find: "./random-number.node", replacement: "./random-number.browser" }]
        }),
        typescript({
            tsconfig: "./build.tsconfig.json",
            useTsconfigDeclarationDir: true
        }),
        cleanup({ comments: "jsdoc" }),
        json()
    ]
}
