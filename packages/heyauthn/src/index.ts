import { Identity } from "@semaphore-protocol/identity"
import { GenerateAuthenticationOptionsOpts, GenerateRegistrationOptionsOpts } from "@simplewebauthn/server"
import HeyAuthn from "./heyAuthn"

export {
    HeyAuthn,
    GenerateRegistrationOptionsOpts as RegistrationOptions,
    GenerateAuthenticationOptionsOpts as AuthenticationOptions,
    Identity
}
