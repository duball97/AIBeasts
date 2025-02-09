require("dotenv").config(); // Load env variables
const { ethers } = require("hardhat");

const fs = require("fs");

// Path to your compiled contract artifact
const contractJson = JSON.parse(
  fs.readFileSync(
    "./artifacts/contracts/AiBeastsBattle.sol/BattleBet.json",
    "utf8"
  )
);

// Extract the ABI
const ABI = contractJson.abi;

async function main() {
  const provider = new ethers.JsonRpcProvider(
    process.env.ALCHEMY_SEPOLIA_ENDPOINT
  );

  // Load both wallets from .env
  const player1 = new ethers.Wallet(process.env.PLAYER1_PRIVATE_KEY, provider);
  const player2 = new ethers.Wallet(process.env.PLAYER2_PRIVATE_KEY, provider);

  // Contract details
  const contractAddress = "0xe09e2D98cF3f1B2F26715249a133C35a8Fb70777";
  const contractPlayer1 = new ethers.Contract(contractAddress, ABI, player1);
  const contractPlayer2 = new ethers.Contract(contractAddress, ABI, player2);

  const stakeWei = ethers.parseEther("0.0001"); // 1e14

  // --- Step 1: Player1 Creates the Battle ---
  console.log(`Player1 (${player1.address}) creating a battle...`);

  const createTx = await contractPlayer1.createAndJoinBattle({
    value: stakeWei,
  });
  await createTx.wait();
  console.log("Battle created!");

  // Get the latest battle ID
  const currentBattleId = await contractPlayer1.battleCounter();
  console.log("Current Battle ID:", currentBattleId.toString());

  // Cancel Battle

  const cancelTx = await contractPlayer1.cancelBattle(currentBattleId);
  await cancelTx.wait();
  console.log("Battle canceled!");

  /* // --- Step 2: Player2 Joins the Battle ---
  console.log(
    `Player2 (${player2.address}) joining battle #${currentBattleId}...`
  );

  const join2Tx = await contractPlayer2.joinExistingBattle(currentBattleId, {
    value: stakeWei,
  });
  await join2Tx.wait();

  console.log(`Player2 joined battle #${currentBattleId}!`);

  // --- Step 3: Battle Winner ---
  console.log("Declaring winner...");

  const battleWinner = player1.address;

  const winnerTx = await contractPlayer1.declareWinner(
    currentBattleId,
    battleWinner
  );
  await winnerTx.wait();

  console.log("Battle winner is player 1!"); */
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
