const { ethers } = require("hardhat");

async function main() {
  //Setting contract addresses

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const feeWallet = "0xdc28630221B2d58B8E249Df6d96c928f57bed952";

  const MyAIBeasts = await ethers.getContractFactory("BattleBet");
  const MyAIBeastsDeployment = await MyAIBeasts.deploy(feeWallet);

  console.log("AIBeasts address:", MyAIBeastsDeployment.target);
  const aiBeastsAddress = MyAIBeastsDeployment.target;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
