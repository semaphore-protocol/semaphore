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
        { file: pkg.exports["."].require, format: "cjs", banner, exports: "auto" },
        { file: pkg.exports["."].default, format: "es", banner },
        {
            dir: "./dist/lib.commonjs",
            format: "cjs",
            banner,
            preserveModules: true,
            entryFileNames: "[name].cjs"
        },
        { dir: "./dist/lib.esm", format: "es", banner, preserveModules: true }
    ],
    plugins: [
        typescript({
            tsconfig: "./build.tsconfig.json",
            useTsconfigDeclarationDir: true
        }),
        cleanup({ comments: "jsdoc" })
    ]
}
