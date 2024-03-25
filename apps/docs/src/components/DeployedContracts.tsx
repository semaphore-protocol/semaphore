import { deployedContracts } from "@semaphore-protocol/utils"
import Heading from "@theme/Heading"

function capitalizeFirstLetter(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function getEtherscanLink(network: string): string {
    switch (network) {
        case "sepolia":
            return "https://sepolia.etherscan.io/address/"
        case "mumbai":
            return "https://mumbai.polygonscan.com/address/"
        case "arbitrum":
            return "https://arbiscan.io/address/"
        case "arbitrum-sepolia":
            return "https://sepolia.arbiscan.io/address/"
        case "optimism-sepolia":
            return "https://sepolia-optimism.etherscan.io/address/"
        default:
            return ""
    }
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
                                <a href={getEtherscanLink(network) + address} target="_blank" rel="noreferrer">
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
