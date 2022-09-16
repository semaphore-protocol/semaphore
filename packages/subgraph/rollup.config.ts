import * as fs from "fs"
import cleanup from "rollup-plugin-cleanup"
import { terser } from "rollup-plugin-terser"
import typescript from "rollup-plugin-typescript2"

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"))
const name = pkg.name.substr(1).replace(/[-/]./g, (x: string) => x.toUpperCase()[1])
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
            file: pkg.iife,
            name,
            format: "iife",
            globals: { axios: "axios" },
            banner
        },
        {
            file: pkg.unpkg,
            name,
            format: "iife",
            globals: { axios: "axios" },
            plugins: [terser({ output: { preamble: banner } })]
        },
        { file: pkg.exports.require, format: "cjs", banner, exports: "auto" },
        { file: pkg.exports.import, format: "es", banner }
    ],
    external: Object.keys(pkg.dependencies),
    plugins: [
        typescript({ tsconfig: "./build.tsconfig.json", useTsconfigDeclarationDir: true }),
        cleanup({ comments: "jsdoc" })
    ]
}
