### Bitcoin Transaction Decoder

This is a Node.js script that provides a tool for decoding Bitcoin transactions.

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

# How It Works

The `transaction_parser.js` script utilizes the `inquirer` library to prompt the user for input. It then parses the input hexadecimal string representing a Bitcoin transaction.

- The script extracts the transaction version, inputs, outputs, scriptPubKey, sequence, and witness data (if applicable) from the transaction data.
- It utilizes variable length integer encoding to parse the number of inputs and outputs.
- For Segregated Witness transactions, it identifies and parses the witness data associated with each input.
