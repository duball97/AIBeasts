const { ethers } = require("hardhat");

async function main() {
  //Setting contract addresses

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const MyAIBeasts = await ethers.getContractFactory("BattleBet2");
  const MyAIBeastsDeployment = await MyAIBeasts.deploy();

  console.log("AIBeasts address:", MyAIBeastsDeployment.target);
  const aiBeastsAddress = MyAIBeastsDeployment.target;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
