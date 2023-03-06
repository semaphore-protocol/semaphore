import { Contract } from "@ethersproject/contracts"
import SemaphoreEthers from "./ethers"

describe("SemaphoreEthers", () => {
    let semaphore: SemaphoreEthers

    describe("# SemaphoreEthers", () => {
        it("Should instantiate a SemaphoreEthers object with different networks", () => {
            semaphore = new SemaphoreEthers("goerli")
            const semaphore1 = new SemaphoreEthers("arbitrum")
            const semaphore2 = new SemaphoreEthers("homestead", {
                address: "0x0000000000000000000000000000000000000000"
            })

            expect(semaphore.contract).toBeInstanceOf(Contract)
            expect(semaphore.network).toBe("goerli")
            expect(semaphore1.contract).toBeInstanceOf(Contract)
            expect(semaphore1.network).toBe("arbitrum")
            expect(semaphore2.contract).toBeInstanceOf(Contract)
            expect(semaphore2.network).toBe("homestead")
            expect(semaphore2.options.startBlock).toBe(0)
            expect(semaphore2.options.address).toContain("0x000000")
        })

        it("Should instantiate a SemaphoreEthers object with different providers", () => {
            const semaphore1 = new SemaphoreEthers("homestead", {
                provider: "infura",
                address: "0x0000000000000000000000000000000000000000",
                apiKey: "1234567890"
            })
            const semaphore2 = new SemaphoreEthers("homestead", {
                provider: "etherscan",
                address: "0x0000000000000000000000000000000000000000"
            })
            const semaphore3 = new SemaphoreEthers("homestead", {
                provider: "alchemy",
                address: "0x0000000000000000000000000000000000000000"
            })
            const semaphore4 = new SemaphoreEthers("homestead", {
                provider: "cloudflare",
                address: "0x0000000000000000000000000000000000000000"
            })
            const semaphore5 = new SemaphoreEthers("homestead", {
                provider: "pocket",
                address: "0x0000000000000000000000000000000000000000"
            })
            const semaphore6 = new SemaphoreEthers("homestead", {
                provider: "ankr",
                address: "0x0000000000000000000000000000000000000000"
            })

            expect(semaphore1.options.provider).toBe("infura")
            expect(semaphore1.options.apiKey).toBe("1234567890")
            expect(semaphore2.options.provider).toBe("etherscan")
            expect(semaphore3.options.provider).toBe("alchemy")
            expect(semaphore4.options.provider).toBe("cloudflare")
            expect(semaphore5.options.provider).toBe("pocket")
            expect(semaphore6.options.provider).toBe("ankr")
        })

        it("Should instantiate a SemaphoreEthers object with a custom URL", () => {
            const semaphore1 = new SemaphoreEthers("http://localhost:8545", {
                address: "0x0000000000000000000000000000000000000000"
            })

            expect(semaphore1.network).toBe("http://localhost:8545")
        })

        it("Should throw an error if the network is not supported by Semaphore yet and there's no address", () => {
            const fun = () => new SemaphoreEthers("homestead")

            expect(fun).toThrow("You should provide a Semaphore contract address for this network")
        })

        it("Should throw an error if the provider is not supported", () => {
            const fun = () =>
                new SemaphoreEthers("goerli", {
                    provider: "hello" as any
                })

            expect(fun).toThrow("Provider 'hello' is not supported")
        })
    })

    describe("# getGroupIds", () => {
        it("Should return all the existing groups", async () => {
            const groupIds = await semaphore.getGroupIds()

            expect(groupIds).toContain("42")
        })
    })

    describe("# getGroup", () => {
        it("Should return a specific group", async () => {
            const group = await semaphore.getGroup("42")

            expect(group.merkleTree.depth).toBe("20")
            expect(group.merkleTree.zeroValue).toContain("33712832")
        })

        it("Should throw an error if the group does not exist", async () => {
            const fun = () => semaphore.getGroup("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })

    describe("# getGroupAdmin", () => {
        it("Should return a group admin", async () => {
            const admin = await semaphore.getGroupAdmin("42")

            expect(admin).toBe("0xA9C2B639a28cDa8b59C4377e980F75A93dD8605F")
        })

        it("Should throw an error if the group does not exist", async () => {
            const fun = () => semaphore.getGroupAdmin("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })

    describe("# getGroupMembers", () => {
        it("Should return a list of group members", async () => {
            const [member] = await semaphore.getGroupMembers("42")

            expect(member).toContain("20833604")
        })

        it("Should throw an error if the group does not exist", async () => {
            const fun = () => semaphore.getGroupMembers("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })

    describe("# getGroupVerifiedProofs", () => {
        it("Should return a list of group verified proofs", async () => {
            const [verifiedProof] = await semaphore.getGroupVerifiedProofs("42")

            expect(verifiedProof.signal).toContain("377211729")
        })

        it("Should throw an error if the group does not exist", async () => {
            const fun = () => semaphore.getGroupVerifiedProofs("666")

            await expect(fun).rejects.toThrow("Group '666' not found")
        })
    })
})
