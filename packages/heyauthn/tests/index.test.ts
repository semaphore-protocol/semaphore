import { Identity } from "@semaphore-protocol/identity"
import {
    GenerateAuthenticationOptionsOpts as AuthenticationOptions,
    GenerateRegistrationOptionsOpts as RegistrationOptions
} from "@simplewebauthn/server"

import { HeyAuthn } from "../src"

jest.mock("@simplewebauthn/browser", () => ({
    startRegistration: async () => ({
        id: "my-new-credential",
        rawId: "my-new-credential",
        response: {
            clientDataJSON: "",
            attestationObject: ""
        },
        clientExtensionResults: {},
        type: "public-key"
    }),
    startAuthentication: async () => ({
        id: "my-existing-credential",
        rawId: "my-existing-credential",
        response: {
            clientDataJSON: "",
            attestationObject: ""
        },
        clientExtensionResults: {},
        type: "public-key"
    })
}))

describe("HeyAuthn", () => {
    describe("# getIdentity", () => {
        it("Should get the identity of the HeyAuthn instance", async () => {
            const expectedIdentity = new Identity()
            const heyAuthn = new HeyAuthn(expectedIdentity)
            const identity = heyAuthn.getIdentity()

            expect(expectedIdentity.toString()).toEqual(identity.toString())
        })
    })

    describe("# fromRegister", () => {
        const options: RegistrationOptions = {
            rpName: "my-app",
            rpID: "hostname",
            userID: "my-id",
            userName: "my-name"
        }

        it("Should create an identity identical to the one created registering credential", async () => {
            const { identity } = await HeyAuthn.fromRegister(options)
            const expectedIdentity = new Identity("my-new-credential")

            expect(identity.secretScalar).toEqual(expectedIdentity.secretScalar)
            expect(identity.commitment).toEqual(expectedIdentity.commitment)
        })
    })

    describe("# fromAuthenticate", () => {
        const options: AuthenticationOptions = {
            rpID: "hostname"
        }

        it("Should create an identity identical to the one created authenticating credential", async () => {
            const { identity } = await HeyAuthn.fromAuthenticate(options)
            const expectedIdentity = new Identity("my-existing-credential")

            expect(identity.secretScalar).toEqual(expectedIdentity.secretScalar)
            expect(identity.commitment).toEqual(expectedIdentity.commitment)
        })
    })
})
