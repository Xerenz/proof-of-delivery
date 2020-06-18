const path = require('path');
const fs = require('fs');
const solc = require('solc');

const PODPath = path.resolve(__dirname,'POD.sol');
const source = fs.readFileSync(PODPath,'utf8');
//console.log(solc.compile(source,1).contracts[':POD']);
//var compileOutput = solc.compile(source,1).contracts[':POD']
module.exports = solc.compile(source,1).contracts[':POD'];
