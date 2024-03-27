import { deployedContracts, supportedNetworks } from "@semaphore-protocol/utils"
import Heading from "@theme/Heading"

function capitalizeFirstLetter(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function DeployedContracts() {
    return (
        <div>
            {deployedContracts.map(({ network, contracts }) => (
                <div key={network}>
                    <Heading as="h2">{capitalizeFirstLetter(network)}</Heading>
                    <ul>
                        {contracts.map(({ name, address }) => (
                            <li key={address}>
                                {name}:{" "}
                                <a
                                    href={`${supportedNetworks[network].explorer}/address/${address}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {address}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    )
}
