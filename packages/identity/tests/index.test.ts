import { derivePublicKey, deriveSecretScalar } from "@zk-kit/eddsa-poseidon"
import { poseidon2 } from "poseidon-lite"
import { Identity } from "../src"

describe("Identity", () => {
    const privateKeyText = "secret"
    const privateKeyBuffer = Buffer.from("another secret")

    describe("# Identity", () => {
        it("Should create an identity with a random secret (private key)", () => {
            const identity = new Identity()
            const privateKey = Buffer.from(identity.privateKey)

            expect(identity.privateKey).toHaveLength(32)
            expect(identity.secretScalar).toBe(deriveSecretScalar(privateKey))
            expect(identity.publicKey).toStrictEqual(derivePublicKey(privateKey))
            expect(identity.commitment).toBe(poseidon2(identity.publicKey))
        })

        it("Should create a deterministic identity from a secret text (private key)", () => {
            const identity = new Identity(privateKeyText)

            expect(identity.secretScalar).toBe(deriveSecretScalar(privateKeyText))
            expect(identity.publicKey).toStrictEqual(derivePublicKey(privateKeyText))
            expect(identity.commitment).toBe(poseidon2(identity.publicKey))
        })

        it("Should create a deterministic identity from a secret buffer (private key)", () => {
            const identity = new Identity(privateKeyBuffer)

            expect(identity.secretScalar).toBe(deriveSecretScalar(privateKeyBuffer))
            expect(identity.publicKey).toStrictEqual(derivePublicKey(privateKeyBuffer))
            expect(identity.commitment).toBe(poseidon2(identity.publicKey))
        })

        it("Should create the same identity if the private key is the same", () => {
            const identity = new Identity()

            const identity2 = new Identity(identity.privateKey)

            expect(identity.privateKey).toStrictEqual(identity2.privateKey)
            expect(identity.secretScalar).toBe(identity2.secretScalar)
            expect(identity.publicKey).toStrictEqual(identity2.publicKey)
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
            const identity = new Identity(privateKeyBuffer)

            const privateKey = identity.export()

            expect(typeof privateKey).toBe("string")
            expect(Buffer.from(privateKey, "base64")).toStrictEqual(privateKeyBuffer)
        })
    })

    describe("# import", () => {
        it("Should import an identity with a private key of buffer type", () => {
            const identity = new Identity(privateKeyBuffer)
            const privateKey = identity.export()

            const identity2 = Identity.import(privateKey)

            expect(identity2.privateKey).toStrictEqual(identity.privateKey)
            expect(identity2.secretScalar).toBe(identity.secretScalar)
            expect(identity2.publicKey).toStrictEqual(identity.publicKey)
            expect(identity2.commitment).toBe(identity.commitment)
        })

        it("Should import an identity with a private key of text type", () => {
            const identity = new Identity(privateKeyText)
            const privateKey = identity.export()

            const identity2 = Identity.import(privateKey)

            expect(identity2.privateKey).toStrictEqual(Buffer.from(identity.privateKey))
            expect(identity2.secretScalar).toBe(identity.secretScalar)
            expect(identity2.publicKey).toStrictEqual(identity.publicKey)
            expect(identity2.commitment).toBe(identity.commitment)
        })

        it("Should import an identity generated from a random private key", () => {
            const identity = new Identity()
            const privateKey = identity.export()

            const identity2 = Identity.import(privateKey)

            expect(identity2.privateKey).toStrictEqual(Buffer.from(identity.privateKey))
            expect(identity2.secretScalar).toBe(identity.secretScalar)
            expect(identity2.publicKey).toStrictEqual(identity.publicKey)
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

        it("Should verify a signature with a Buffer private key", () => {
            const identity = new Identity(privateKeyBuffer)

            const signature = identity.signMessage("message")

            expect(Identity.verifySignature("message", signature, identity.publicKey)).toBeTruthy()
        })
    })

    describe("# generateCommitment", () => {
        it("Should generate the identity commitment from the public key", () => {
            const identity = new Identity(privateKeyText)

            const commitment = Identity.generateCommitment(identity.publicKey)

            expect(identity.commitment).toBe(commitment)
        })
    })
})
