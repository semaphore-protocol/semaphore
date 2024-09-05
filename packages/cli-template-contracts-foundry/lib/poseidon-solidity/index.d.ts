type PresignedDeploy = {
  from: string
  gas: string
  tx: string
  proxyAddress: string
  address: string
  salt: string
  bytecode: string
  data: string
}

declare module 'poseidon-solidity' {
  export const PoseidonT2: PresignedDeploy
  export const PoseidonT3: PresignedDeploy
  export const PoseidonT4: PresignedDeploy
  export const PoseidonT5: PresignedDeploy
  export const PoseidonT6: PresignedDeploy
  export const proxy: {
    from: string
    gas: string
    tx: string
    address: string
  }
}
