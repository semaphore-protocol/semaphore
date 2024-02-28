import Identity from "./identity"

describe("Identity", () => {
    describe("# Identity", () => {
        it("Should not create a identity if the parameter is not valid", async () => {
            const fun = async (i: any) => {
                const id = new Identity()
                await id.init(i)
                return id
            }

            await expect(fun(13 as any)).rejects.toThrow(new TypeError("Parameter 'identityOrMessage' is not a string"))
            await expect(fun(true as any)).rejects.toThrow(
                new TypeError("Parameter 'identityOrMessage' is not a string")
            )
            await expect(fun((() => true) as any)).rejects.toThrow(
                new TypeError("Parameter 'identityOrMessage' is not a string")
            )
        })

        it("Should create random identities", async () => {
            const identity1 = new Identity()
            await identity1.init()
            const identity2 = new Identity()
            await identity2.init()

            expect(identity1.trapdoor).not.toBe(identity2.getTrapdoor())
            expect(identity1.nullifier).not.toBe(identity2.getNullifier())
            expect(identity1.secret).not.toBe(identity2.getSecret())
            expect(identity1.commitment).not.toBe(identity2.getCommitment())
        })

        it("Should create deterministic identities from a message", async () => {
            const identity1 = new Identity()
            await identity1.init("message")
            const identity2 = new Identity()
            await identity2.init("message")

            expect(identity1.trapdoor).toStrictEqual(identity2.getTrapdoor())
            expect(identity1.nullifier).toStrictEqual(identity2.getNullifier())
        })

        it("Should create deterministic identities from number/boolean messages", async () => {
            const identity1 = new Identity()
            await identity1.init("true")
            const identity2 = new Identity()
            await identity2.init("true")
            const identity3 = new Identity()
            await identity3.init("7")
            const identity4 = new Identity()
            await identity4.init("7")

            expect(identity1.trapdoor).toStrictEqual(identity2.getTrapdoor())
            expect(identity1.nullifier).toStrictEqual(identity2.getNullifier())
            expect(identity3.trapdoor).toStrictEqual(identity4.getTrapdoor())
            expect(identity3.nullifier).toStrictEqual(identity4.getNullifier())
        })

        it("Should not recreate an existing invalid identity", async () => {
            const fun = async (i: any) => {
                const id = new Identity()
                await id.init(i)
                return id
            }

            await expect(fun('[true, "01323"]')).rejects.toThrow()
        })

        it("Should recreate an existing identity", async () => {
            const identity1 = new Identity()
            await identity1.init("message")

            const identity2 = new Identity()
            await identity2.init(identity1.toString())

            expect(identity1.trapdoor).toStrictEqual(identity2.getTrapdoor())
            expect(identity1.nullifier).toStrictEqual(identity2.getNullifier())
        })
    })

    describe("# getTrapdoor", () => {
        it("Should return the identity trapdoor", async () => {
            const identity = new Identity()
            await identity.init("message")

            const trapdoor = identity.getTrapdoor()

            expect(trapdoor.toString()).toBe("0x19922bd8da917b7552dbb8342db69e9f2de6e4ed9f966a217048c482ee1ab2a5")
        })
    })

    describe("# getNullifier", () => {
        it("Should return the identity nullifier", async () => {
            const identity = new Identity()
            await identity.init("message")

            const nullifier = identity.getNullifier()

            expect(nullifier.toString()).toBe("0x1f1b5eaf4668f989ad73aaeb663fcc0efc59690fec152c467811968f3b7e62a7")
        })
    })

    describe("# getSecret", () => {
        it("Should return an identity secret", async () => {
            const identity = new Identity()
            await identity.init("message")
            const { secret } = identity

            expect(secret.toString()).toBe("0x0f2780e09410f2ec25773032e54549fd9d0248b7a761fdb616d33b2cbad7d75c")
        })
    })

    describe("# getCommitment", () => {
        it("Should return an identity commitment", async () => {
            const identity = new Identity()
            await identity.init("message")
            const { commitment } = identity

            expect(commitment.toString()).toBe("0x1e2c3d4155d87f0fcc3ec5ba1bebbc53db9f9d43d93bc9e62bbdc7ab93a32d5e")
        })
    })

    describe("# toString", () => {
        it("Should return a string", async () => {
            const identity = new Identity()
            await identity.init("message")

            const identityString = identity.toString()

            expect(typeof identityString).toBe("string")
        })

        it("Should return a valid identity string", async () => {
            const identity = new Identity()
            await identity.init("message")

            const [trapdoor, nullifier] = JSON.parse(identity.toString())

            expect(trapdoor).toBe(identity.trapdoor.toString())
            expect(nullifier).toBe(identity.nullifier.toString())
        })
    })
})
