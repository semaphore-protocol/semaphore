import { BigNumber } from "@ethersproject/bignumber"
import Identity from "./identity"

describe("Identity", () => {
    describe("# Identity", () => {
        it("Should not create a identity if the parameter is not valid", () => {
            const fun1 = () => new Identity(13 as any)
            const fun2 = () => new Identity(true as any)
            const fun3 = () => new Identity((() => true) as any)

            expect(fun1).toThrow("Parameter 'identityOrMessage' is not a string")
            expect(fun2).toThrow("Parameter 'identityOrMessage' is not a string")
            expect(fun3).toThrow("Parameter 'identityOrMessage' is not a string")
        })

        it("Should create random identities", () => {
            const identity1 = new Identity()
            const identity2 = new Identity()

            expect(identity1.trapdoor).not.toBe(identity2.getTrapdoor())
            expect(identity1.nullifier).not.toBe(identity2.getNullifier())
            expect(identity1.commitment).not.toBe(identity2.getCommitment())
        })

        it("Should create deterministic identities from a message", () => {
            const identity1 = new Identity("message")
            const identity2 = new Identity("message")

            expect(identity1.trapdoor).toBe(identity2.getTrapdoor())
            expect(identity1.nullifier).toBe(identity2.getNullifier())
        })

        it("Should create deterministic identities from number/boolean messages", () => {
            const identity1 = new Identity("true")
            const identity2 = new Identity("true")
            const identity3 = new Identity("7")
            const identity4 = new Identity("7")

            expect(identity1.trapdoor).toBe(identity2.getTrapdoor())
            expect(identity1.nullifier).toBe(identity2.getNullifier())
            expect(identity3.trapdoor).toBe(identity4.getTrapdoor())
            expect(identity3.nullifier).toBe(identity4.getNullifier())
        })

        it("Should not recreate an existing invalid identity", () => {
            const fun = () => new Identity('[true, "01323"]')

            expect(fun).toThrow("invalid BigNumber string")
        })

        it("Should recreate an existing identity", () => {
            const identity1 = new Identity("message")

            const identity2 = new Identity(identity1.toString())

            expect(identity1.trapdoor).toBe(identity2.getTrapdoor())
            expect(identity1.nullifier).toBe(identity2.getNullifier())
        })
    })

    describe("# getTrapdoor", () => {
        it("Should return the identity trapdoor", () => {
            const identity = new Identity("message")

            const trapdoor = identity.getTrapdoor()

            expect(trapdoor).toBe(BigInt("211007102311354422986775462856672883657031335757695461477990303178796954863"))
        })
    })

    describe("# getNullifier", () => {
        it("Should return the identity nullifier", () => {
            const identity = new Identity("message")

            const nullifier = identity.getNullifier()

            expect(nullifier).toBe(BigInt("10282208199720122340759039255952223220417076359839127631923809108800013776"))
        })
    })

    describe("# generateCommitment", () => {
        it("Should generate an identity commitment", () => {
            const { commitment } = new Identity("message")

            expect(commitment).toBe(
                BigInt("13192222509545780880434144549342414064490325100975031303723930089730328393905")
            )
        })
    })

    describe("# toString", () => {
        it("Should return a string", () => {
            const identity = new Identity("message")

            const identityString = identity.toString()

            expect(typeof identityString).toBe("string")
        })

        it("Should return a valid identity string", () => {
            const identity = new Identity("message")

            const [trapdoor, nullifier] = JSON.parse(identity.toString())

            expect(BigNumber.from(`0x${trapdoor}`).toBigInt()).toBe(identity.trapdoor)
            expect(BigNumber.from(`0x${nullifier}`).toBigInt()).toBe(identity.nullifier)
        })
    })
})
