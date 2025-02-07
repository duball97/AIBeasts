require("dotenv").config(); // Load env variables
const { ethers } = require("hardhat");

// Contract ABI
const ABI = [
  {
    inputs: [
      { internalType: "address", name: "_player2", type: "address" },
      { internalType: "uint256", name: "_stake", type: "uint256" },
    ],
    name: "createBattle",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_battleId", type: "uint256" }],
    name: "joinBattle",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "battleCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_battleId", type: "uint256" },
      { internalType: "address", name: "_winner", type: "address" },
    ],
    name: "declareWinner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

async function main() {
  const provider = new ethers.JsonRpcProvider(
    process.env.ALCHEMY_SEPOLIA_ENDPOINT
  );

  // Load both wallets from .env
  const player1 = new ethers.Wallet(process.env.PLAYER1_PRIVATE_KEY, provider);
  const player2 = new ethers.Wallet(process.env.PLAYER2_PRIVATE_KEY, provider);

  // Contract details
  const contractAddress = "0x28Cd3c3CB8C10b3Cb94E0a358898C4913CE2097e";
  const contractPlayer1 = new ethers.Contract(contractAddress, ABI, player1);
  const contractPlayer2 = new ethers.Contract(contractAddress, ABI, player2);

  const stakeWei = ethers.parseEther("0.0001"); // 1e14

  // --- Step 1: Player1 Creates the Battle ---
  console.log(`Player1 (${player1.address}) creating a battle...`);

  const createTx = await contractPlayer1.createBattle(
    player2.address,
    stakeWei
  );
  await createTx.wait();
  console.log("Battle created!");

  // Get the latest battle ID
  const currentBattleId = await contractPlayer1.battleCounter();
  console.log("Current Battle ID:", currentBattleId.toString());

  // --- Step 2: Player1 Joins the Battle ---
  console.log(
    `Player1 (${player1.address}) joining battle #${currentBattleId}...`
  );

  const joinTx = await contractPlayer1.joinBattle(currentBattleId, {
    value: stakeWei,
  });
  await joinTx.wait();

  console.log(`Player1 joined battle #${currentBattleId}!`);

  // --- Step 2: Player2 Joins the Battle ---
  console.log(
    `Player2 (${player2.address}) joining battle #${currentBattleId}...`
  );

  const join2Tx = await contractPlayer2.joinBattle(currentBattleId, {
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

  console.log("Battle winner is player 1!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
