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

const MAX_ARGS = 7

const toHex = (n) => '0x' + BigInt(n).toString(16)

const mul = (v1, v2) => `mulmod(${v1}, ${v2}, F)`
const addmod = (v1, v2) => `addmod(${v1}, ${v2}, F)`
const add = (v1, v2) => `add(${v1}, ${v2})`
const mod = (v1) => `mod(${v1}, F)`

const buildMixSteps = (T, options = {}) => {
  Object.assign(
    {
      forceFinalMod: false,
    },
    options
  )
  let f = ''
  const unusedMemOffset = 128 + 32 * (T - 2)
  for (let x = 0; x < T; x++) {
    const mem = x < 2 ? toHex(32 * x) : toHex(128 + 32 * (x - 2))
    const muls = Array(T)
      .fill()
      .map((_, i) => {
        if (i < MAX_ARGS) {
          return mul(`state${i}`, `M${i}${x}`)
        } else {
          return mul(
            `mload(${toHex(unusedMemOffset + 32 * (i - MAX_ARGS))})`,
            `M${i}${x}`
          )
        }
      })
    if (T > MAX_ARGS) {
      // split into two additions
      let _add = add(muls.shift(), muls.shift())
      _add = add(_add, muls.shift())
      _add = add(_add, muls.shift())
      f += `p := ${_add}\n`

      _add = add(muls.shift(), muls.shift())
      for (let y = 0; y < muls.length + 1; y++) {
        if (y === muls.length) {
          _add = add(_add, `p`)
        } else {
          _add = add(_add, muls[y])
        }
      }
      f += `mstore(${mem}, ${_add})\n`
    } else {
      // one addition
      let _add = add(muls.shift(), muls.shift())
      let addCount = 2
      for (let y = 0; y < muls.length; y++) {
        _add = add(_add, muls[y])
        addCount++
        if (addCount === 4) {
          _add = mod(_add)
          addCount = 0
        }
      }
      if (addCount >= 3 || options.forceFinalMod) {
        _add = mod(_add)
      }
      f += `mstore(${mem}, ${_add})\n`
    }
  }
  return f
}

export function genTContract(T) {
  const C = constants.C[T - 2]
  const M = constants.M[T - 2]
  const ROUNDS_P = _ROUNDS_P[T - 2]
  const unusedMemOffset = 128 + 32 * (T - 2)

  let f = `/// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

library PoseidonT${T} {

uint constant F = ${F};

`

  for (let x = 0; x < T; x++) {
    for (let y = 0; y < T; y++) {
      f += `uint constant M${x}${y} = ${M[y][x]};\n`
    }
  }

  f += `

// See here for a simplified implementation: https://github.com/vimwitch/poseidon-solidity/blob/e57becdabb65d99fdc586fe1e1e09e7108202d53/contracts/Poseidon.sol#L40
// Inspired by: https://github.com/iden3/circomlibjs/blob/v0.0.8/src/poseidon_slow.js
function hash(uint[${T - 1}] memory) public pure returns (uint) {
assembly {

// memory 0x00 to 0x3f (64 bytes) is scratch space for hash algos
// we can use it in inline assembly because we're not calling e.g. keccak
//
// memory 0x80 is the default offset for free memory
// we take inputs as a memory argument so we simply write over
// that memory after loading it

// we have the following variables at memory offsets
// state0 - 0x00
// state1 - 0x20
// state2 - 0x80
// state3 - 0xa0
// state4 - ...

function pRound(${Array(Math.min(T, MAX_ARGS))
    .fill(null)
    .map((_, i) => `c${i}`)
    .join(', ')}) {
`
  for (let x = 0; x < T; x++) {
    const mem = x < 2 ? toHex(32 * x) : toHex(128 + 32 * (x - 2))
    if (x < MAX_ARGS) {
      if (T >= 6 && x > 0) {
        f += `let state${x} := addmod(mload(${mem}), c${x}, F)\n`
      } else {
        f += `let state${x} := add(mload(${mem}), c${x})\n`
      }
    } else {
      const _mem = toHex(unusedMemOffset + 32 * (x - MAX_ARGS))
      if (T >= 6 && x > 0) {
        f += `mstore(${_mem}, addmod(mload(${mem}), mload(${_mem}), F))\n`
      } else {
        f += `mstore(${_mem}, add(mload(${mem}), mload(${_mem})))\n`
      }
    }
  }

  f += `

  let p := mulmod(state0, state0, F)
  state0 := mulmod(mulmod(p, p, F), state0, F)

  ${buildMixSteps(T)}
}

function fRound(${Array(Math.min(T, MAX_ARGS))
    .fill(null)
    .map((_, i) => `c${i}`)
    .join(', ')}) {
`
  // for (let x = 0; x < T; x++) {
  //   const mem = x < 2 ? toHex(32 * x) : toHex(128 + 32 * (x-2))
  //   f += `let state${x} := addmod(mload(${mem}), c${x}, F)\n`
  // }
  for (let x = 0; x < T; x++) {
    const mem = x < 2 ? toHex(32 * x) : toHex(128 + 32 * (x - 2))
    if (x < MAX_ARGS) {
      f += `let state${x} := ${add(`mload(${mem})`, `c${x}`)}\n`
    } else {
      const _mem = toHex(unusedMemOffset + 32 * (x - MAX_ARGS))
      f += `mstore(${_mem}, ${add(`mload(${mem})`, `mload(${_mem})`)})\n`
    }
  }

  f += '\n'

  for (let x = 0; x < T; x++) {
    if (x < MAX_ARGS) {
      f += `${x === 0 ? 'let ' : ''}p := mulmod(state${x}, state${x}, F)\n`
      f += `state${x} := mulmod(mulmod(p, p, F), state${x}, F)\n`
    } else {
      const mem = toHex(unusedMemOffset + 32 * (x - MAX_ARGS))
      f += `c0 := mload(${mem})\n`
      f += `p := mulmod(c0, c0, F)\n`
      f += `mstore(${mem}, mulmod(mulmod(p, p, F), c0, F))\n`
    }
  }

  f += '\n'

  f += buildMixSteps(T)

  f += `
}

// scratch variable for exponentiation
let p
`

  let r = 0

  // pre-calculate the first state0 pow5mod
  // and the first mix values

  const state0 = BigInt(C[0]) ** BigInt(5) % BigInt(F)

  const SM = []
  for (let x = 0; x < T; x++) {
    SM[x] = (state0 * BigInt(M[x][0])) % BigInt(F)
  }

  f += `\n{\n`

  f += '// load the inputs from memory\n'

  for (let x = 1; x < Math.min(T, MAX_ARGS); x++) {
    const mem = toHex(128 + 32 * (x - 1))
    f += `let state${x} := add(mod(mload(${mem}), F), ${C[r * T + x]})\n`
  }
  for (let x = T; x >= Math.min(T, MAX_ARGS); --x) {
    // TODO: fix this for higher arity hashes
    if (true) break
    const mem = toHex(128 + 32 * (x - 1))
    const _mem = toHex(unusedMemOffset + 32 * (x - MAX_ARGS))
    f += `mstore(${_mem}, add(mod(mload(${mem}), F), ${C[r * T + x]}))\n`
  }

  f += '\n'

  for (let x = 1; x < T; x++) {
    if (x < MAX_ARGS) {
      f += `p := mulmod(state${x}, state${x}, F)\n`
      f += `state${x} := mulmod(mulmod(p, p, F), state${x}, F)\n`
    } else {
      const _mem = toHex(unusedMemOffset + 32 * (x - MAX_ARGS))
      f += `p := mload(${_mem})\n`
      f += `p := mulmod(p, p, F)\n`
      f += `mstore(${_mem}, mulmod(mulmod(p, p, F), mload(${_mem}), F))\n`
    }
  }
  f += `

  // state0 pow5mod and M[] multiplications are pre-calculated

`
  let precalcMix = buildMixSteps(T)
  for (let x = 0; x < T; x++) {
    precalcMix = precalcMix.replace(
      `mulmod(state0, M0${x}, F)`,
      '0x' + SM[x].toString(16)
    )
  }
  f += precalcMix
  f += `}\n`

  r++

  for (; r < ROUNDS_F + ROUNDS_P - 1; r++) {
    for (let x = MAX_ARGS; x < T; x++) {
      const mem = toHex(unusedMemOffset + 32 * (x - MAX_ARGS))
      f += `\nmstore(${mem}, ${C[r * T + x]})\n`
    }
    const func =
      r < ROUNDS_F / 2 || r >= ROUNDS_F / 2 + ROUNDS_P ? 'fRound' : 'pRound'
    f += `
${func}(`
    for (let x = 0; x < Math.min(T, MAX_ARGS); x++) {
      f += `${C[r * T + x]}${x === Math.min(T, MAX_ARGS) - 1 ? '' : ','}\n`
    }
    f += `)
`
  }

  f += `\n{\n`

  for (let x = 0; x < T; x++) {
    const mem = x < 2 ? toHex(32 * x) : toHex(128 + 32 * (x - 2))
    if (x < MAX_ARGS) {
      f += `let state${x} := add(mload(${mem}), ${C[r * T + x]})\n`
    } else {
      const _mem = toHex(unusedMemOffset + 32 * (x - MAX_ARGS))
      f += `mstore(${_mem}, add(mload(${mem}), ${C[r * T + x]}))\n`
    }
  }

  f += '\n'

  for (let x = 0; x < T; x++) {
    if (x < MAX_ARGS) {
      f += `p := mulmod(state${x}, state${x}, F)\n`
      f += `state${x} := mulmod(mulmod(p, p, F), state${x}, F)\n`
    } else {
      const mem = toHex(unusedMemOffset + 32 * (x - MAX_ARGS))
      f += `p := mload(${mem})\n`
      f += `p := mulmod(p, p, F)\n`
      f += `mstore(${mem}, mulmod(mulmod(p, p, F), ${`mload(${mem})`}, F))\n`
    }
  }
  let lastMix = buildMixSteps(T, { forceFinalMod: true }).split('\n')[0]
  if (T > MAX_ARGS) {
    lastMix = buildMixSteps(T, { forceFinalMod: true })
      .split('\n')
      .slice(0, 2)
      .join('\n')
  }

  f += `
  ${lastMix}
  return(0, 0x20)
}
}
}
}
`

  return f
}
