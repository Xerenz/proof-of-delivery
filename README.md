# proof-of-delivery
Blockchain based solution to validate physical assets in supply chain.

## React-App

Use "npm start" to run app.

## Smart contracts

POD.sol contains the smart contract.
deploy smart contract and use the address and the abi before running the app.
Copy and paste the abi and address in the POD.js file in ./src folder.

## Setups

### Metamask
Sets up wallet - use addresses in your metamask to deploy the app

### Web3.js
Injects web3 object to your browser to interact with smart contract (need to implement newer version of web3)

## How the app works?

The contract consists of 5 entities
1. Buyer
2. Seller
3. Transporter
4. Arbritrator
5. Attestation authority

The state change in the contract by each of the entities happen in a sequential manner.

These state changes are designed so that each participating entity has an incentive to act honestly in the contract.
