import { ethers } from 'ethers'
import poseidon from '../build/index.js'
const { proxy } = poseidon

const { PRIVATE_KEY } = process.env

if (!PRIVATE_KEY) throw new Error('Specify a private key in environment')

const RPC_URL = process.env.RPC_URL ?? 'https://arbitrum.goerli.unirep.io'

if (!RPC_URL.startsWith('http')) throw new Error('RPC url must be http(s)')

const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
const signer = new ethers.Wallet(PRIVATE_KEY, provider)

if (await provider.getCode(proxy.address) === '0x') {
  await signer.sendTransaction({
    to: proxy.from,
    value: proxy.gas,
  })
  await provider.sendTransaction(proxy.tx)
}

for (const [key, val] of Object.entries(poseidon)) {
  const { address, data } = val
  if (await provider.getCode(address) !== '0x') continue
  await signer.sendTransaction({
    to: proxy.address,
    data,
  }).then(t => t.wait())
  console.log(`${key} deployed to: ${address}`)
}
