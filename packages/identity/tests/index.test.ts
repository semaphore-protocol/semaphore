import { Identity } from "../src"

describe("Identity", () => {
    const privateKeyText = "secret"
    const privateKeyHexadecimal = "dd998334940df8931b76d899fdb189415f7ff4280599f03a7574725a166aad7d"

    describe("# Identity", () => {
        it("Should create an identity with a random secret (private key)", () => {
            const identity = new Identity()

            expect(typeof identity.privateKey).toBe("string")
            expect(identity.privateKey).toHaveLength(64)
            expect(typeof identity.secretScalar).toBe("bigint")
            expect(identity.publicKey).toHaveLength(2)
            expect(typeof identity.commitment).toBe("bigint")
        })

        it("Should create deterministic identities from a secret text (private key)", () => {
            const identity = new Identity(privateKeyText)

            expect(typeof identity.privateKey).toBe("string")
            expect(typeof identity.secretScalar).toBe("bigint")
            expect(identity.publicKey).toHaveLength(2)
            expect(typeof identity.commitment).toBe("bigint")
        })

        it("Should create deterministic identities from a secret hexadecimal (private key)", () => {
            const identity = new Identity(privateKeyHexadecimal)

            expect(typeof identity.privateKey).toBe("string")
            expect(identity.privateKey).toHaveLength(64)
            expect(typeof identity.secretScalar).toBe("bigint")
            expect(identity.publicKey).toHaveLength(2)
            expect(typeof identity.commitment).toBe("bigint")
        })

        it("Should throw an error if the private key is not a string", () => {
            const fun = () => new Identity(32 as any)

            expect(fun).toThrow("Parameter 'privateKey' is not a string, received type: number")
        })
    })

    describe("# signMessage", () => {
        it("Should sign a message", () => {
            const identity = new Identity(privateKeyText)

            const signature = identity.signMessage("message")

            expect(signature.R8).toHaveLength(2)
            expect(typeof signature.R8[0]).toBe("bigint")
            expect(typeof signature.S).toBe("bigint")
        })
    })

    describe("# verifySignature", () => {
        it("Should verify a signature with a text private key", () => {
            const identity = new Identity(privateKeyText)

            const signature = identity.signMessage("message")

            expect(Identity.verifySignature("message", signature, identity.publicKey)).toBeTruthy()
        })

        it("Should verify a signature with hexadecimal private key", () => {
            const identity = new Identity(privateKeyHexadecimal)

            const signature = identity.signMessage("message")

            expect(Identity.verifySignature("message", signature, identity.publicKey)).toBeTruthy()
        })
    })
})
