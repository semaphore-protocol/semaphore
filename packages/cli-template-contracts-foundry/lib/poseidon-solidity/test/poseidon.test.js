const { ethers } = require('hardhat')
const { poseidon_slow, poseidon_gencontract } = require('circomlibjs')
const poseidon = require('poseidon-lite')
const assert = require('assert')

const T = [2, 3, 4, 5, 6]

const F_MAX =
  BigInt(
    '21888242871839275222246405745257275088548364400416034343698204186575808495617'
  ) - BigInt(1)

for (const t of T) {
  const getPoseidon = async (owner) => {
    const Poseidon = await ethers.getContractFactory(`PoseidonT${t}`)
    if (process.env.CI || process.env.DEPLOY) {
      const deployInfo = require(`../deploy/PoseidonT${t}`)
      if ((await ethers.provider.getCode(deployInfo.proxyAddress)) === '0x') {
        await owner.sendTransaction({
          to: deployInfo.from,
          value: deployInfo.gas,
        })
        await ethers.provider.sendTransaction(deployInfo.tx)
      }
      if ((await ethers.provider.getCode(deployInfo.address)) === '0x') {
        const tx = await owner.sendTransaction({
          to: deployInfo.proxyAddress,
          data: deployInfo.data,
        })
        const receipt = await tx.wait()
        console.log(
          `Cost of deploying T${t} (poseidon-solidity): ${receipt.gasUsed.toString()}`
        )
      }
      return Poseidon.attach(deployInfo.address)
    }
    const _poseidon = await Poseidon.deploy()
    const receipt = await _poseidon.deployTransaction.wait()
    console.log(
      `Cost of deploying T${t} (poseidon-solidity): ${receipt.gasUsed.toString()}`
    )
    return _poseidon
  }
  describe(`PoseidonT${t}`, function () {
    it('should hash elements', async () => {
      const [owner] = await ethers.getSigners()
      const _poseidon = await getPoseidon(owner)

      const Test = await ethers.getContractFactory('Test')
      const test = await Test.deploy()
      console.log('soldity implementation:')
      const input = Array(t - 1)
        .fill()
        .map((_, i) => i + 1)
      const h = await test[`benchmarkA${t}`](_poseidon.address, input)
      assert.equal(h.toString(), poseidon_slow(input).toString())
      assert.equal(h.toString(), poseidon(input).toString())
    })
    if (t < 7) {
      it('should check against iden3 impl', async () => {
        const bytecode = poseidon_gencontract.createCode(t - 1)
        const abi = poseidon_gencontract.generateABI(t - 1)
        const [owner] = await ethers.getSigners()
        const Test = await ethers.getContractFactory('Test')
        const test = await Test.deploy()
        const f = new ethers.ContractFactory(abi, bytecode, owner)
        const c = await f.deploy()
        await c.deployed()
        if (t === 3) {
          const receipt = await c.deployTransaction.wait()
          console.log(
            `Cost of deploying T3 (circomlibjs): ${receipt.gasUsed.toString()}`
          )
        }
        console.log('iden3 implementation:')
        const input = Array(t - 1)
          .fill()
          .map((_, i) => i + 1)
        await test[`benchmarkB${t}`](c.address, input)
      })
    }

    it('should check many random elements', async () => {
      const [owner] = await ethers.getSigners()
      const _poseidon = await getPoseidon(owner)
      for (let x = 0; x < 10; x++) {
        const input = Array(t - 1)
          .fill()
          .map(() => poseidon([Math.floor(Math.random() * 100000000)]))
        const h = await _poseidon.hash(input)
        assert.equal(h.toString(), poseidon(input).toString())
        assert.equal(h.toString(), poseidon_slow(input).toString())
      }
    })

    it('should correctly hash edge inputs', async () => {
      const [owner] = await ethers.getSigners()
      const _poseidon = await getPoseidon(owner)
      {
        const input = Array(t - 1).fill(0)
        const h = await _poseidon.hash(input)
        assert.equal(h.toString(), poseidon(input).toString())
        assert.equal(h.toString(), poseidon_slow(input).toString())
      }
      {
        const input = Array(t - 1).fill(F_MAX)
        const h = await _poseidon.hash(input)
        assert.equal(h.toString(), poseidon(input).toString())
        assert.equal(h.toString(), poseidon_slow(input).toString())
      }
    })

    it('should check overflowed inputs', async () => {
      const [owner] = await ethers.getSigners()
      const _poseidon = await getPoseidon(owner)
      for (let x = 0; x < 10; x++) {
        const input = Array(t - 1)
          .fill()
          .map((_, i) => 2n ** 255n + BigInt(i * x))
        const h = await _poseidon.hash(input)
        assert.equal(h.toString(), poseidon(input).toString())
        assert.equal(h.toString(), poseidon_slow(input).toString())
      }
    })
  })
}
