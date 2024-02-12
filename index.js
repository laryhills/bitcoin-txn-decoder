const inquirer = require("inquirer");

const SEGWIT_MARKER_BYTE = 0x00;
const SEGWIT_FLAG_BYTE = 0x01;

async function transactionParser() {
  const { txnHex } = await inquirer.prompt([
    {
      type: "input",
      name: "txnHex",
      message: "Enter the transaction hex:\n",
      validate: (value) => {
        // Validate as a valid hex string
        const isValid = /^[0-9a-fA-F]+$/.test(value);
        return isValid || "Please enter a valid transaction hex.";
      },
    },
  ]);

  // Convert hex to binary
  let transactionBinary = Buffer.from(txnHex, "hex");

  let offset = 0;

  // Transaction version (first 4 bytes)
  let version = transactionBinary.readUInt32LE(offset);

  console.log("Version:", version, "\n");

  // add 4 to offset to move to the next section of the transaction
  offset += 4;

  // Check if it's a Segwit transaction
  let segWitTxn = false;
  const marker = transactionBinary.readUInt8(offset);
  offset += 1;
  const flag = transactionBinary.readUInt8(offset);
  offset += 1;
  if (marker === SEGWIT_MARKER_BYTE && flag === SEGWIT_FLAG_BYTE) {
    segWitTxn = true;
  } else {
    // reset move offset back to previous position
    offset -= 2;
  }

  console.log("______Inputs________");
  // Number of inputs (variable length integer)
  let numInputs = readVarInt(transactionBinary, offset);
  // move offset past the variable length integer
  offset += numInputs.length;

  // Parse inputs
  let inputs = [];
  for (let i = 0; i < numInputs.value; i++) {
    let input = {};

    console.log("Input", i + 1); // Logging input number

    // Previous transaction hash (32 bytes)
    // pick section of transactionBinary based on the offset
    if (transactionBinary.length < offset + 32) {
      throw new Error("Transaction is too short to parse inputs");
    }

    input.prevTxHash = transactionBinary
      .subarray(offset, offset + 32)
      .reverse()
      .toString("hex");
    console.log("Hash:", input.prevTxHash); // Logging previous transaction hash
    offset += 32;

    // Output index (4 bytes)
    input.outputIndex = transactionBinary.readUInt32LE(offset);
    console.log("Index:", input.outputIndex); // Logging output index
    offset += 4;

    // Script length (variable length integer)
    let scriptLength = readVarInt(transactionBinary, offset);
    offset += scriptLength.length;

    // ScriptSig (variable length)
    input.scriptSig = transactionBinary
      .subarray(offset, offset + scriptLength.value)
      .toString("hex");
    console.log("ScriptPubKey:", input.scriptSig); // Logging ScriptSig
    offset += scriptLength.value;

    // Sequence (4 bytes)
    input.sequence = transactionBinary.readUInt32LE(offset);
    console.log("Sequence:", input.sequence); // Logging sequence
    offset += 4;

    inputs.push(input);

    // if not last item, log
    i + 1 !== numInputs.value && console.log("");
  }

  console.log("______Outputs________");
  // Number of outputs (variable length integer)
  let numOutputs = readVarInt(transactionBinary, offset);
  offset += numOutputs.length; // Move offset past the variable length integer

  // Parse outputs
  let outputs = [];
  for (let i = 0; i < numOutputs.value; i++) {
    let output = {};

    console.log("Output", i + 1); // Logging output number

    // Value (8 bytes)
    // The "n" suffix in JavaScript indicates that the number is a BigInt.
    // + converts to number
    output.value = Number(transactionBinary.readBigUInt64LE(offset));
    console.log("Value:", output.value);
    offset += 8;

    // Script length (variable length integer)
    let scriptLength = readVarInt(transactionBinary, offset);
    offset += scriptLength.length;

    // ScriptPubKey (variable length)
    output.scriptPubKey = transactionBinary
      .subarray(offset, offset + scriptLength.value)
      .toString("hex");
    console.log("ScriptPubKey:", output.scriptPubKey);
    offset += scriptLength.value;

    outputs.push(output);

    // if not last item, log
    i + 1 !== output.value && console.log("");
  }

  if (segWitTxn) {
    for (let i = 0; i < numInputs.value; ++i) {
      let numWitness = readVarInt(transactionBinary, offset);
      offset += numWitness.length;
      inputs[i].witness = [];
      for (let j = 0; j < numWitness.value; j++) {
        let witnessData;
        // Witness script length (variable length integer)
        let witnessScript = readVarInt(transactionBinary, offset);
        offset += witnessScript.length;

        // Witness data (variable length)
        witnessData = transactionBinary
          .subarray(offset, offset + witnessScript.value)
          .toString("hex");
        offset += witnessScript.value;

        inputs[i].witness.push(witnessData);
      }
    }
  }

  // Locktime (4 bytes)
  let locktime = transactionBinary.readUInt32LE(offset);
  offset += 4;

  console.log("Locktime:", locktime);

  if (offset !== transactionBinary.length) {
    throw new Error("Transaction has unexpected data");
  }
}

function readVarInt(buffer, offset) {
  let firstByte = buffer.readUInt8(offset);

  if (firstByte < 0xfd) {
    return {
      value: firstByte,
      length: 1,
    };
  } else if (firstByte === 0xfd) {
    return {
      value: buffer.readUInt16LE(offset + 1),
      length: 3,
    };
  } else if (firstByte === 0xfe) {
    return {
      value: buffer.readUInt32LE(offset + 1),
      length: 5,
    };
  } else {
    return {
      value: buffer.readBigUInt64LE(offset + 1),
      length: 9,
    };
  }
}

transactionParser();
