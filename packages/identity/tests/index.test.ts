import { Identity } from "../src"

describe("Identity", () => {
    const privateKeyText = "secret"
    const privateKeyBuffer = Buffer.from(privateKeyText)

    describe("# Identity", () => {
        it("Should create an identity with a random secret (private key)", () => {
            const identity = new Identity()

            expect(typeof identity.privateKey).toBe("object")
            expect(identity.privateKey).toHaveLength(32)
            expect(typeof identity.secretScalar).toBe("bigint")
            expect(identity.publicKey).toHaveLength(2)
            expect(typeof identity.commitment).toBe("bigint")
        })

        it("Should create a deterministic identity from a secret text (private key)", () => {
            const identity = new Identity(privateKeyText)

            expect(typeof identity.privateKey).toBe("string")
            expect(typeof identity.secretScalar).toBe("bigint")
            expect(identity.publicKey).toHaveLength(2)
            expect(typeof identity.commitment).toBe("bigint")
        })

        it("Should create a deterministic identity from a secret buffer (private key)", () => {
            const identity = new Identity(privateKeyBuffer)

            expect(typeof identity.privateKey).toBe("object")
            expect(identity.privateKey).toHaveLength(6)
            expect(typeof identity.secretScalar).toBe("bigint")
            expect(identity.publicKey).toHaveLength(2)
            expect(typeof identity.commitment).toBe("bigint")
        })

        it("Should create the same identity if the private key is the same", () => {
            const identity = new Identity()

            const identity2 = new Identity(identity.privateKey)

            expect(identity.commitment).toBe(identity2.commitment)
        })

        it("Should throw an error if the private key is not a string", () => {
            const fun = () => new Identity(32 as any)

            expect(fun).toThrow("Parameter 'privateKey' is none of the following types: Buffer, Uint8Array, string")
        })
    })

    describe("# export", () => {
        it("Should export an identity where the private key is a buffer", () => {
            const identity = new Identity(privateKeyBuffer)

            const privateKey = identity.export()

            expect(typeof privateKey).toBe("string")
            expect(Buffer.from(privateKey, "base64")).toStrictEqual(privateKeyBuffer)
        })

        it("Should export an identity where the private key is text", () => {
            const identity = new Identity(privateKeyText)

            const privateKey = identity.export()

            expect(typeof privateKey).toBe("string")
            expect(Buffer.from(privateKey, "base64")).toStrictEqual(privateKeyBuffer)
        })
    })

    describe("# import", () => {
        it("Should import an identity", () => {
            const identity = new Identity(privateKeyBuffer)
            const privateKey = identity.export()

            const identity2 = Identity.import(privateKey)

            expect(identity2.commitment).toBe(identity.commitment)
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
            const identity = new Identity(privateKeyBuffer)

            const signature = identity.signMessage("message")

            expect(Identity.verifySignature("message", signature, identity.publicKey)).toBeTruthy()
        })
    })
})
