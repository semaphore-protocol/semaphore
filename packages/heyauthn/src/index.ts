import { Identity } from "@semaphore-protocol/identity"
import { GenerateAuthenticationOptionsOpts, GenerateRegistrationOptionsOpts } from "@simplewebauthn/server"
import HeyAuthn from "./hey-authn"

export {
    HeyAuthn,
    GenerateRegistrationOptionsOpts as RegistrationOptions,
    GenerateAuthenticationOptionsOpts as AuthenticationOptions,
    Identity
}
