import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    GenerateRegistrationOptionsOpts as RegistrationOptions,
    GenerateAuthenticationOptionsOpts as AuthenticationOptions
} from "@simplewebauthn/server"
import { startAuthentication, startRegistration } from "@simplewebauthn/browser"
import { Identity } from "@semaphore-protocol/identity"

export default class HeyAuthn {
    private _identity: Identity

    constructor(identity: Identity) {
        this._identity = identity
    }

    /**
     * Registers a new WebAuthn credential and returns its HeyAuthn instance.
     *
     * @param {GenerateRegistrationOptionsOpts} options - WebAuthn options for registering a new credential.
     * @returns A HeyAuthn instance with the newly registered credential.
     */
    public static async fromRegister(options: RegistrationOptions) {
        const registrationOptions = generateRegistrationOptions(options)
        const { id } = await startRegistration(registrationOptions)

        const identity = new Identity(id)

        return new HeyAuthn(identity)
    }

    /**
     * Authenticates an existing WebAuthn credential and returns its HeyAuthn instance.
     *
     * @param {GenerateAuthenticationOptionsOpts} options - WebAuthn options for authenticating an existing credential.
     * @returns A HeyAuthn instance with the existing credential.
     */
    public static async fromAuthenticate(options: AuthenticationOptions) {
        const authenticationOptions = generateAuthenticationOptions(options)
        const { id } = await startAuthentication(authenticationOptions)

        const identity = new Identity(id)

        return new HeyAuthn(identity)
    }

    /**
     * Returns the Semaphore identity instance.
     * @returns The Semaphore identity.
     */
    public get identity(): Identity {
        return this._identity
    }

    /**
     * Returns the Semaphore identity instance.
     * @returns The Semaphore identity.
     */
    public getIdentity(): Identity {
        return this._identity
    }
}
