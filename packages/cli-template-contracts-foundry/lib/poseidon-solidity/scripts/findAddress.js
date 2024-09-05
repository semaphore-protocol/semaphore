const { ethers } = require('ethers')
const path = require('path')
const fs = require('fs').promises

const [,,contractName, startR] = process.argv

const proxyAddress = '0x4e59b44847b379578588920ca78fbf26c0b4956c'
const { bytecode } = require(path.join(__dirname, `../artifacts/contracts/${contractName}.sol/${contractName}.json`))
const initCodeHash = ethers.utils.keccak256(bytecode)

const prefix = `0x${''.padStart(3, contractName.slice(-1))}333`

const start = +new Date()
const _startR = Number(startR ?? 0)
let r = _startR
for (;;) {
  try {
  	const salt = '0x' + r.toString().padStart(64,'0')
  	const contractAddress = ethers.utils.getCreate2Address(proxyAddress, salt, initCodeHash)
		if (r%100000===0 && r !== _startR) {
			console.log(r)
			const now = +new Date()
			console.log(`${Math.floor((r-_startR)/((now - start)/1000))} salts/sec`)
		}
		if (contractAddress.startsWith(prefix)) {
			const deploy = {
				from: '0x3fab184622dc19b6109349b94811493bf2a45362',
				gas: '10000000000000000',
				tx: '0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222',
				proxyAddress,
				address: contractAddress,
				salt,
				bytecode,
				data: `${salt}${bytecode.replace('0x', '')}`,
			}
			const out = `module.exports = ${JSON.stringify(deploy, null, 2)}`
			fs.writeFile(path.join(__dirname, `../deploy/${contractName}.js`), out)
				.then(() => {
					console.log(`Destination: ${contractAddress}`)
					console.log(`✨ Wrote ${contractName}.json`)
					process.exit(0)
				})
				.catch(console.log)
	    break
		}
	} catch (_){
		console.log(_)
		process.exit(1)
	}
	r++
}
