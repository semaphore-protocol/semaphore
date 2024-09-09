-include .env

DEFAULT_ANVIL_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
DEFAULT_ANVIL_ADDRESS := 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
DEFAULT_RPC_URL := http://localhost:8545

.PHONY: all test clean

all: clean remove install build

# Clean the repo
clean  :; forge clean

# Remove modules
remove :; rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules && git add . && git commit -m "modules"

install :; forge install semaphore-protocol/semaphore privacy-scaling-explorations/zk-kit.solidity chancehudson/poseidon-solidity OpenZeppelin/openzeppelin-contracts foundry-rs/forge-std

install-no-git :; forge install --no-git semaphore-protocol/semaphore privacy-scaling-explorations/zk-kit.solidity chancehudson/poseidon-solidity OpenZeppelin/openzeppelin-contracts foundry-rs/forge-std

# Update Dependencies
update :; forge update

build :; forge build

test :; forge test -vvv

gas-report :; forge test --gas-report

snapshot :; forge snapshot

format :; forge fmt

slither :; slither ./src 

#format :; prettier --write src/**/*.sol && prettier --write src/*.sol

# solhint should be installed globally
lint :; solhint src/**/*.sol && solhint src/*.sol

# use the "@" to hide the command from your shell
deploy :; @forge script script/DeployFeedback.s.sol:DeployFeedback --rpc-url $(DEFAULT_RPC_URL) --private-key $(DEFAULT_ANVIL_KEY) --broadcast -vvvvv

deploy-sepolia :; @forge script script/DeployFeedback.s.sol:DeployFeedback --rpc-url $(SEPOLIA_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvvv

deploy-sepolia-verify :; @forge script script/DeployFeedback.s.sol:DeployFeedback --rpc-url $(SEPOLIA_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvvv