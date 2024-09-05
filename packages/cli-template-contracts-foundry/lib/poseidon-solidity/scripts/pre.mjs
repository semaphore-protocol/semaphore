import fs from 'fs/promises'
import path from 'path'
import url from 'url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const packagePath = path.join(__dirname, '../package.json')
const _package = JSON.parse((await fs.readFile(packagePath)).toString())

const finalPackage = Object.assign(_package, {
  devDependencies: {},
  dependencies: {},
  scripts: {},
})
delete finalPackage.prettier

const buildDir = path.join(__dirname, '../build')

await fs.rm(buildDir, { recursive: true, force: true })
await fs.mkdir(buildDir)

await fs.writeFile(path.join(buildDir, 'package.json'), JSON.stringify(finalPackage, null, 2))

await fs.cp(path.join(__dirname, '../contracts'), buildDir, { recursive: true })
await fs.rm(path.join(buildDir, 'Test.sol'))

await fs.rm(path.join(buildDir, 'deploy'), { recursive: true, force: true })
await fs.cp(path.join(__dirname, '../deploy'), path.join(buildDir, 'deploy'), { recursive: true })

await fs.cp(path.join(__dirname, '../index.js'), path.join(buildDir, 'index.js'))
await fs.cp(path.join(__dirname, '../index.d.ts'), path.join(buildDir, 'index.d.ts'))

await fs.cp(path.join(__dirname, '../README.md'), path.join(buildDir, 'README.md'))
