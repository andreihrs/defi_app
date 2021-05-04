const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");
const dBank = artifacts.require("dBank");
const Token = artifacts.require("Token");

module.exports = async function(deployer, network, accounts) {
  // Deploy Mock DAI Token
  await deployer.deploy(DaiToken);
  const daiToken = await DaiToken.deployed();

  // Deploy Dapp Token
  await deployer.deploy(DappToken);
  const dappToken = await DappToken.deployed();

  // Deploy TokenFarm
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address);
  const tokenFarm = await TokenFarm.deployed();

  // Transfer all tokens to TokenFarm (1 million)
  await dappToken.transfer(tokenFarm.address, "1000000000000000000000000");

  // Transfer 100 Mock DAI tokens to investor
  await daiToken.transfer(accounts[1], "100000000000000000000");

  //deploy Token
  await deployer.deploy(Token);

  //assign token into variable to get it's address
  const token = await Token.deployed();

  //pass token address for dBank contract(for future minting)
  await deployer.deploy(dBank, token.address);

  //assign dBank contract into variable to get it's address
  const dbank = await dBank.deployed();

  //change token's owner/minter from deployer to dBank
  await token.passMinterRole(dbank.address);
};
