import { BigNumber } from "@ethersproject/bignumber"
import Identity from "./identity"

describe("Identity", () => {
<<<<<<< HEAD
  const chainID = BigInt(1337)
  describe("# Identity", () => {
    it("Should not create a identity if the parameter is not valid", () => {
      const fun1 = () => new Identity(chainID, 13 as any)
      const fun2 = () => new Identity(chainID, true as any)
      const fun3 = () => new Identity(chainID, (() => true) as any)
=======
    describe("# Identity", () => {
        it("Should not create a identity if the parameter is not valid", () => {
            const fun1 = () => new Identity(13 as any)
            const fun2 = () => new Identity(true as any)
            const fun3 = () => new Identity((() => true) as any)
>>>>>>> origin/main

      expect(fun1).toThrow("Parameter 'identityOrMessage' is not a string")
      expect(fun2).toThrow("Parameter 'identityOrMessage' is not a string")
      expect(fun3).toThrow("Parameter 'identityOrMessage' is not a string")
    })

    it("Should create random identities", () => {
<<<<<<< HEAD
      const identity1 = new Identity(chainID)
      const identity2 = new Identity(chainID)

      expect(identity1.getTrapdoor()).not.toBe(identity2.getTrapdoor())
      expect(identity1.getNullifier()).not.toBe(identity2.getNullifier())
    })

    it("Should create deterministic identities from a message", () => {
      const identity1 = new Identity(chainID, "message")
      const identity2 = new Identity(chainID, "message")

      expect(identity1.getTrapdoor()).toBe(identity2.getTrapdoor())
      expect(identity1.getNullifier()).toBe(identity2.getNullifier())
    })

    it("Should create deterministic identities from number/boolean messages", () => {
      const identity1 = new Identity(chainID, "true")
      const identity2 = new Identity(chainID, "true")
      const identity3 = new Identity(chainID, "7")
      const identity4 = new Identity(chainID, "7")

      expect(identity1.getTrapdoor()).toBe(identity2.getTrapdoor())
      expect(identity1.getNullifier()).toBe(identity2.getNullifier())
      expect(identity3.getTrapdoor()).toBe(identity4.getTrapdoor())
      expect(identity3.getNullifier()).toBe(identity4.getNullifier())
    })

    it("Should not recreate an existing invalid identity", () => {
      const fun = () => new Identity(chainID, '[true, "01323"]')
=======
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
>>>>>>> origin/main

      expect(fun).toThrow("invalid BigNumber string")
    })

    it("Should recreate an existing identity", () => {
<<<<<<< HEAD
      const identity1 = new Identity(chainID, "message")

      const identity2 = new Identity(chainID, identity1.toString())

      expect(identity1.getTrapdoor()).toBe(identity2.getTrapdoor())
      expect(identity1.getNullifier()).toBe(identity2.getNullifier())
=======
            const identity1 = new Identity("message")

            const identity2 = new Identity(identity1.toString())

            expect(identity1.trapdoor).toBe(identity2.getTrapdoor())
            expect(identity1.nullifier).toBe(identity2.getNullifier())
>>>>>>> origin/main
    })
  })

  describe("# getTrapdoor", () => {
    it("Should return the identity trapdoor", () => {
<<<<<<< HEAD
      const identity = new Identity(chainID, "message")
=======
            const identity = new Identity("message")
>>>>>>> origin/main

      const trapdoor = identity.getTrapdoor()

      expect(trapdoor).toBe(
<<<<<<< HEAD
        BigInt(
          "58952291509798197436757858062402199043831251943841934828591473955215726495831"
        )
=======
                BigInt("58952291509798197436757858062402199043831251943841934828591473955215726495831")
>>>>>>> origin/main
      )
    })
  })

  describe("# getNullifier", () => {
    it("Should return the identity nullifier", () => {
<<<<<<< HEAD
      const identity = new Identity(chainID, "message")
=======
            const identity = new Identity("message")
>>>>>>> origin/main

      const nullifier = identity.getNullifier()

      expect(nullifier).toBe(
<<<<<<< HEAD
        BigInt(
          "44673097405870585416457571638073245190425597599743560105244308998175651589997"
        )
=======
                BigInt("44673097405870585416457571638073245190425597599743560105244308998175651589997")
>>>>>>> origin/main
      )
    })
  })

  describe("# generateCommitment", () => {
    it("Should generate an identity commitment", () => {
<<<<<<< HEAD
      const identity = new Identity(chainID, "message")
=======
            const identity = new Identity("message")
>>>>>>> origin/main

      const commitment = identity.generateCommitment()

      expect(commitment).toBe(
<<<<<<< HEAD
        BigInt(
          "1720349790382552497189398984241859233944354304766757200361065203741879866188"
        )
=======
                BigInt("1720349790382552497189398984241859233944354304766757200361065203741879866188")
>>>>>>> origin/main
      )
    })
  })

  describe("# toString", () => {
    it("Should return a string", () => {
<<<<<<< HEAD
      const identity = new Identity(chainID, "message")
=======
            const identity = new Identity("message")
>>>>>>> origin/main

      const identityString = identity.toString()

      expect(typeof identityString).toBe("string")
    })

    it("Should return a valid identity string", () => {
<<<<<<< HEAD
      const identity = new Identity(chainID, "message")

      const [trapdoor, nullifier] = JSON.parse(identity.toString())

      expect(BigNumber.from(`0x${trapdoor}`).toBigInt()).toBe(
        identity.getTrapdoor()
      )
      expect(BigNumber.from(`0x${nullifier}`).toBigInt()).toBe(
        identity.getNullifier()
      )
=======
            const identity = new Identity("message")

            const [trapdoor, nullifier] = JSON.parse(identity.toString())

            expect(BigNumber.from(`0x${trapdoor}`).toBigInt()).toBe(identity.getTrapdoor())
            expect(BigNumber.from(`0x${nullifier}`).toBigInt()).toBe(identity.getNullifier())
>>>>>>> origin/main
    })
  })
})
