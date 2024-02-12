### Bitcoin Transaction CLI

This is a Node.js script that provides various utilities for interacting with Bitcoin transactions and scripts. It utilizes the `bitcoinjs-lib` library along with other dependencies to perform actions such as constructing transactions, evaluating scripts, and more.

#### Prerequisites

Before running the script, ensure you have Node.js installed on your system. You'll also need to install the required dependencies:

```bash
npm install
```

#### Usage

To use the script, simply run:

```bash
node index.js
```

This will prompt you to choose from a list of actions:

1. **Show Transaction Details From Hex**: Display details of a Bitcoin transaction given its hex representation.
2. **Evaluate Bitcoin Script From Hex**: Evaluate a Bitcoin script given its hex representation.
3. **Get Byte Encoding of a String**: Get the byte encoding of a string.
4. **Get Redeem Script from Pre-Image**: Generate a redeem script from a pre-image.
5. **Derive a Address from a Redeem Script**: Derive an address from a redeem script.
6. **Construct a Transaction That Sends to the Script Address**: Construct a transaction that sends funds to a script address.
7. **Construct a Transaction That Spends From the Address**: Construct a transaction that spends funds from an address.

Follow the prompts for each action to provide the required input and observe the results.

#### Notes

- This script currently supports interactions with the Bitcoin testnet.
- Make sure to set your desired fee rate (in satoshis per byte) in the `feeRate` variable.
- Ensure you have sufficient funds in your wallet when constructing transactions.
