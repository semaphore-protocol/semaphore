import { genTContract } from './buildPoseidon.mjs'
import { genTContractSimple } from './buildPoseidonSimple.mjs'

export default [
  {
    T: 2,
    build: () =>
      genTContractSimple(2, {
        mStackCount: 0,
      }),
  },
  {
    T: 3,
    build: () =>
      genTContractSimple(3, {
        mStackCount: 3,
      }),
  },
  {
    T: 4,
    build: () => genTContract(4),
  },
  {
    T: 5,
    build: () => genTContract(5),
  },
  {
    T: 6,
    build: () => genTContract(6),
  },
]
