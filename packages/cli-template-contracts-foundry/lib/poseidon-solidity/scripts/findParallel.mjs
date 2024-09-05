import child_process from 'child_process'
import os from 'os'
import url from 'url'
import path from 'path'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const cores = os.cpus().length
console.log(`Search ${cores} processes...`)

// pass a space separated list of circuit names to this executable
const [, , contractName] = process.argv

const increment = 10000000
let r = 0
let found = false

const processes = []
for (let x = 0; x < cores; x++) {
    spawnProcess()
}

function spawnProcess() {
    const searchProcess = child_process.fork(
        path.join(__dirname, 'findAddress.js'),
        [contractName, r]
    )
    processes.push(searchProcess)
    r += increment
    searchProcess.on('exit', (code) => {
        if (found) return
        // otherwise, we found and wrote the file, exit
        if (code != 0) return
        found = true
        for (const p of processes) {
            p.kill()
        }
        process.exit(0)
    })
}
