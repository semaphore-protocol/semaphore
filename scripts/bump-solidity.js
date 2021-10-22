const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/

process.chdir('./contracts');
const content = fs.readFileSync("Verifier.sol", { encoding: 'utf-8' });
const bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');


fs.writeFileSync("Verifier.sol", bumped);