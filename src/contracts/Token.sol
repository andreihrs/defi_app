pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract Token is ERC20, ERC20Detailed {
  address public minter;

  event MinterChanged(address indexed from, address to);

  constructor() public ERC20Detailed("Decentralized Bank Currency", "DBC", 18) {
    minter = msg.sender; //only initially
  }

  function passMinterRole(address dBank) public returns (bool) {
  	require(msg.sender == minter, 'Error, only owner can change pass minter role');
  	minter = dBank;

    emit MinterChanged(msg.sender, dBank);
    return true;
  }

  function mint(address account, uint256 amount) public {
		require(msg.sender==minter, 'Error, msg.sender does not have minter role'); //dBank
		_mint(account, amount);
	}
}