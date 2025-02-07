// battle.js
const { ethers } = require("hardhat");

const ABI = [
  // createBattle(address,uint256) returns (uint256)
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
  // joinBattle(uint256)
  {
    inputs: [{ internalType: "uint256", name: "_battleId", type: "uint256" }],
    name: "joinBattle",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  // battleCounter()
  {
    inputs: [],
    name: "battleCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

async function main() {
  // 2. Set up your provider and signer for Base
  //    - Replace with your actual RPC URL for Base (mainnet or testnet).

  const [deployer] = await ethers.getSigners();

  //const provider = new ethers.BrowserProvider(process.env.SEPLOIA_);

  // 4. Create a contract instance
  //    - Replace with your actual deployed contract address on Base.
  const contractAddress = "0x28Cd3c3CB8C10b3Cb94E0a358898C4913CE2097e";
  const contract = new ethers.Contract(contractAddress, ABI, deployer);

  // 5. Define the second player's address and your desired stake in wei
  //    - For 0.0001 ETH, that's 0.0001 * 1e18 = 100000000000000 (1e14).
  const player2 = "0xdc28630221B2d58B8E249Df6d96c928f57bed952";
  const stakeWei = ethers.parseEther("0.0001"); // 1e14

  // --- Step A: Create a new battle ---
  console.log("Creating battle...");
  const createTx = await contract.createBattle(player2, stakeWei, {
    gasLimit: 30000, // This attaches 0.0001 ETH as the bet
  });
  const createReceipt = await createTx.wait();

  // The contract’s createBattle returns an ID, but in ethers.js
  // you only get the transaction data. We can read the current `battleCounter`
  // after it’s mined to figure out the newly created battle ID.

  const currentBattleId = await contract.battleCounter();
  console.log("Current Battle ID:", currentBattleId.toString());

  // The newly created battle should have ID = currentBattleId.

  // --- Step B: Join the battle (assume you are player1 or player2) ---
  // Send 0.0001 ETH in the transaction to cover your stake.
  console.log(`Joining battle #${currentBattleId} with 0.0001 ETH...`);
  const joinTx = await contract.joinBattle(currentBattleId, {
    value: stakeWei,
    gasLimit: 30000, // This attaches 0.0001 ETH as the bet
  });
  const joinReceipt = await joinTx.wait();
  console.log("Joined battle, tx hash:", joinReceipt.transactionHash);

  console.log("Done!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
