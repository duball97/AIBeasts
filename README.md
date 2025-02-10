# AI Beasts (Alpha Test Version)

AI Beasts is an AI strategy game where players shape, build and train AI-powered beasts, equip them with unique powers, to battle against other beasts around the world. Players can compete in battles for free or in betting matches on the beast arena. 

Your imagination has no limits, train the AI with the most crazy powers and see how it performs against other users around the world.

Play for free and rank your beast  , with the winner taking the prize after a small fee is deducted. The game is deployed on **Base & Arbitrum networks** for fast and low-cost transactions.

If you are looking to contribute, give feedback, sign up to test new versions, or learn more, please follow the repository or reach out directly at our [telegram](https://t.me/aibeasts) or directly to [telegram](https://t.me/duball69) or [x](https://x.com/duball69).

## 🚀 Features

- **Train your beast** - Build its personality, teach it new powers  
- **Play for free** - Challenge your friends or play online for free
- **Betting Battle System** - Fight to earn **1.9x the bet amount**
- **Secure Smart Contracts** - All transactions are managed on **Base & Arbitrum** networks
- **Shape your beast** - Customize your beast appearance with text prompts

---

## 📜 Game Mechanics Overview

The game operates on a **battle system** powered by a **Solidity smart contract** deployed on Base & Arbitrum. The contract:
- **Manages battles** (creation, joining, and results)
- **Betting Matches** (create lobbies and bet that you will win the game)
- **Holds funds in escrow** until the winner is determined
- **Distributes winnings** directly into the winner's wallet
- **Prevents exploits** with security measures

### Contract Main Functions:
- `createAndJoinBattle()` - Player 1 starts a battle and stakes funds
- `joinExistingBattle(battleId)` - Player 2 joins an open battle
- `declareWinner(battleId, winnerAddress)` - Declares the winner and distributes funds
- `cancelBattle(battleId)` - Allows Player 1 to cancel if no one has joined yet
- `getOpenBattles()` - Fetches available battles

---

## 🔗 Blockchain Integration

| Network  | Explorer Link |
|----------|--------------|
| **Base** | [BaseScan](https://basescan.org/address/0x09e6A3953ABC8ae847973F50a0652a2f9ED71722) |
| **Arbitrum** | [ArbiScan](https://arbiscan.io/address/0x4CAA8b4845F3dB19Dc67E394cc686eFd6116ef64) |

---

## 💰 Battle Rewards System

- Players enter battles with a stake.
- The **winner gets 1.9x** the staked amount (after a small fee goes to the AI Beasts treasury).
- Smart contracts handle the **secure escrow & payout**.

---

## 🎮 How to Play

### Start the Game
Go to [our website](https://aibeasts.io)
Sign up to play

### Start building your beast
- Define its name
- Shape its appearance by making text prompts on the training chat
- Generate its new style 
- Build its personality
- Teach it powers


### Create or Join a Battle
- Play online (for free) or in betting matches
- Set your lobby conditions or join an existing one

### Fight & Win!
- AI-powered beasts battle based on their **training and abilities**.
- The **winner is determined** and receives **1.9x their bet**.

### Claim Winnings 💸
On a free game, you will earn you experience points and be able to keep on evolving your beast. 
On a betting game, our smart contract will **automatically transfers funds** to the winner's wallet.

---

## 🛠️ FOR DEVS

### Prerequisites:
- **Node.js** (v18+ recommended)
- **Hardhat** (for smart contract deployment)
- **OpenAI API** (ai interactions)
- **Flux Replicate API** (for image generation)
- **Ethers.js** (for blockchain interactions)
- **dotenv** (for private key management)

### Install Dependencies:
```bash
npm install
```


Lots to build.

## 📩 Contact & Support
- **Twitter**: [@AIBeastsGame](https://twitter.com/AIBeastsGame)
- **Telegram**: [Join AI Beasts Community](https://t.me/aibeasts)
- **Duball69**: [@Duball69](https://twitter.com/duball69)

**AI Beasts - The Ultimate AI Battle Arena!** 🦾🔥

