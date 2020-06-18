import Web3 from 'web3';

const web3 = new Web3(window.ethereum);

window.ethereum.enable();

export default web3;
