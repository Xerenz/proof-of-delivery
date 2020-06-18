const HDWalletProvider=require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compileOutput=require('./compile.js');
const provider = new HDWalletProvider(
  '',
  'https://rinkeby.infura.io/v3/<t>',
  0,
  5
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('Attempting to deploy from account',accounts[0])
  const result = await new web3.eth.Contract(JSON.parse(compileOutput.interface))
  .deploy(
    {
    data:'0x'+compileOutput.bytecode, arguments:[
      accounts[0],
      accounts[1],
      accounts[2],
      accounts[3],
      accounts[4],
      '123456']
    }
  )
  .send({gas:'5000000',from:accounts[0]});

 // const result = await new web3.eth.Contract(JSON.parse(compileOutput.interface))
 // .new(
 //   '0xB9167Ab34d35bef846922B624Ba88E485576Ff41',
 //   '0xB9167Ab34d35bef846922B624Ba88E485576Ff41',
 //   '0xB9167Ab34d35bef846922B624Ba88E485576Ff41',
 //   '0xB9167Ab34d35bef846922B624Ba88E485576Ff41',
 //   '0xB9167Ab34d35bef846922B624Ba88E485576Ff41',
 //   '0x7465737400000000000000000000000000000000000000000000000000000000',
 //   {data: compileOutput.bytecode, from: web3.eth.accounts[0], gas: 4700000})

  console.log(compileOutput.interface)
  console.log(accounts)
  console.log('Contract deployed to',result.options.address);


  return {interface : compileOutput.interface , address: result.options.address};
};
 deploy();
//https://rinkeby.infura.io/v3/0828ad67880b46708ae2ef0a8e59759f
// export {deploy}
