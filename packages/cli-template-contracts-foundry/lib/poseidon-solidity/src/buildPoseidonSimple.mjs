import fs from 'fs/promises'
import path from 'path'
import url from 'url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const constantPath = path.join(__dirname, 'poseidon_constants.json')
const constants = JSON.parse((await fs.readFile(constantPath)).toString())

// generate the function

const ROUNDS_F = 8
const _ROUNDS_P = [
  56, 57, 56, 60, 60, 63, 64, 63, 60, 66, 60, 65, 70, 60, 64, 68,
]
const F =
  '21888242871839275222246405745257275088548364400416034343698204186575808495617'

const MAX_ARGS = 5

const toHex = (n) => '0x' + BigInt(n).toString(16)

const mul = (v1, v2) => `mulmod(${v1}, ${v2}, F)`
const addmod = (v1, v2) => `addmod(${v1}, ${v2}, F)`
const add = (v1, v2) => `add(${v1}, ${v2})`

const mix = (T, state, x, _M) => {
  const muls = Array(T)
    .fill()
    .map((_, i) => {
      if (i === 0 && _M) return _M
      return mul(`${state}${i}`, `M${i}${x}`)
    })
  let _add = add(muls.shift(), muls.shift())
  for (let y = 0; y < muls.length; y++) {
    _add = add(_add, muls[y])
  }
  return _add
}

const finalMix = (T, state, x) => {
  const muls = Array(T)
    .fill()
    .map((_, i) => {
      return mul(`${state}${i}`, `M${i}${x}`)
    })
  let _add = add(muls.shift(), muls.shift())
  for (let y = 0; y < muls.length; y++) {
    _add = add(_add, muls[y])
  }
  return `mod(${_add}, F)`
}

export function genTContractSimple(T, options = {}) {
  //*****
  // build settings
  //*****
  // whether to assign mix output to an intermediate var
  // increases stack depth if enabled
  const compressMixAdd = options.compressMixAdd ?? true
  // how many m constants to put on the stack
  // affects contract size
  const mStackCount = options.mStackCount ?? 3
  // Premultiply/exponentiate the first round state 0 variable
  const premultiplyState0 = options.premultiplyState0 ?? true
  //*****

  const C = constants.C[T - 2]
  const M = constants.M[T - 2]
  const ROUNDS_P = _ROUNDS_P[T - 2]

  let f = `/// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

library PoseidonT${T} {

`

  for (let x = 0; x < T * T - mStackCount; x++) {
    const y = Math.floor(x / T)
    const z = x % T
    f += `uint constant M${y}${z} = ${M[z][y]};\n`
  }

  f += `

// See here for a simplified implementation: https://github.com/vimwitch/poseidon-solidity/blob/e57becdabb65d99fdc586fe1e1e09e7108202d53/contracts/Poseidon.sol#L40
// Inspired by: https://github.com/iden3/circomlibjs/blob/v0.0.8/src/poseidon_slow.js
function hash(uint[${T - 1}] memory) public pure returns (uint) {
assembly {

  let F := ${F}
`
  for (let x = T * T - mStackCount; x < T * T; x++) {
    const y = Math.floor(x / T)
    const z = x % T
    f += `let M${y}${z} := ${M[z][y]}\n`
  }
  let r = 0

  // pre-calculate the first state0 pow5mod
  // and the first mix values

  const state0 = BigInt(C[0]) ** BigInt(5) % BigInt(F)

  const SM = []
  for (let x = 0; x < T; x++) {
    SM[x] = (state0 * BigInt(M[x][0])) % BigInt(F)
  }

  f += '\n// load the inputs from memory'

  const defined = {}
  const varDef = (name) => {
    if (defined[name]) {
      return name
    }
    defined[name] = true
    return `let ${name}`
  }

  f += '\n'

  for (; r < ROUNDS_F + ROUNDS_P; r++) {
    const isFRound = r < ROUNDS_F / 2 || r >= ROUNDS_P + ROUNDS_F / 2
    const state = r % 2 === 0 ? 'state' : 'scratch'
    const scratch = r % 2 === 0 ? 'scratch' : 'state'
    if (r === 0 || !compressMixAdd) {
      for (let y = 0; y < T; y++) {
        if (r === 0 && y === 0 && premultiplyState0) continue
        if (r === 0 && y > 0) {
          const mem = toHex(128 + 32 * (y - 1))
          f += `${varDef(`${state}${y}`)} := add(mod(mload(${mem}), F), ${
            C[r * T + y]
          })\n`
        } else {
          f += `${varDef(`${state}${y}`)} := addmod(${state}${y}, ${
            C[r * T + y]
          }, F)\n`
        }
      }
    }
    for (let y = 0; y < (isFRound ? T : 1); y++) {
      if (r === 0 && y === 0 && premultiplyState0) continue
      f += `${varDef(`${scratch}0`)} := mulmod(${state}${y}, ${state}${y}, F)\n`
      f += `${varDef(
        `${state}${y}`
      )} := mulmod(mulmod(${scratch}0, ${scratch}0, F), ${state}${y}, F)\n`
    }
    for (let y = 0; y < T; y++) {
      if (y > 0 && r === ROUNDS_F + ROUNDS_P - 1) break
      const m = mix(T, state, y, r === 0 && premultiplyState0 ? SM[y] : null)
      if (r < ROUNDS_F + ROUNDS_P - 1 && compressMixAdd) {
        f += `${varDef(`${scratch}${y}`)} := ${add(C[(r + 1) * T + y], m)}\n`
      } else if (compressMixAdd) {
        f += '\n'
        f += `mstore(0x0, ${finalMix(T, state, y)})\n`
      } else {
        f += `${varDef(`${scratch}${y}`)} := ${m}\n`
      }
    }
  }

  if (!compressMixAdd) {
    f += `mstore(0x0, mod(${r % 2 === 0 ? 'state0' : 'scratch0'}, F))\n`
  }
  f += `
  return (0, 0x20)
}
}
}
  `
  return f
}
