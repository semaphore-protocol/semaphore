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

export default [
    {
        input: "src/index.ts",
        output: [
            { file: pkg.exports["."].require, format: "cjs", banner, exports: "auto" },
            { file: pkg.exports["."].default, format: "es", banner }
        ],
        plugins: [
            typescript({
                tsconfig: "./build.tsconfig.json"
            }),
            cleanup({ comments: "jsdoc" })
        ]
    },
    {
        input: "src/index.ts",
        output: [
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
                declaration: false,
                declarationDir: undefined
            }),
            cleanup({ comments: "jsdoc" })
        ]
    }
]
