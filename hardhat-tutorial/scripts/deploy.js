const { ethers } = require("hardhat");

async function main() {
  // first connect to our contract
  const whitelistContract = await ethers.getContractFactory("WhiteList");

  // deploy our contract
  // 10 -> is an argument we pass on to the constructor
  const deployedWhitelistContract = await whitelistContract.deploy(10);

  // wait for it to be deployed
  await deployedWhitelistContract.deployed();

  // after being deployed print its address to the console
  console.log(
    "Whitelist Contract Address: ",
    deployedWhitelistContract.address
  );
}

// perform error handling and exit accordingly
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
