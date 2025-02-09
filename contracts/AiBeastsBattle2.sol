// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract BattleBet2 {
    
    struct Battle {
        address player1;
        address player2;
        uint256 stake;        // stake amount (in wei or in tokens)
        bool player1Staked;
        bool player2Staked;
        address winner;
        bool finished;
    }

    uint256 public battleCounter;
    mapping (uint256 => Battle) public battles;

    address public owner;

    constructor() {
        owner = msg.sender; // ✅ Set the contract deployer as owner
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    // ✅ Create a new battle (No need to provide player2)
    function createBattle(uint256 _stake) external returns (uint256) {
        battleCounter++;
        Battle storage b = battles[battleCounter];
        b.player1 = msg.sender;
        b.stake = _stake;
        
        return battleCounter;
    }

    
// ✅ Join the battle as Player2
function joinBattle(uint256 _battleId) external payable {
    Battle storage b = battles[_battleId];
    require(msg.value == b.stake, "Must send correct stake");

    // ✅ Assign Player2 if not already set BEFORE checking the participant condition
    if (b.player2 == address(0)) {
        b.player2 = msg.sender;
    }

    // ✅ Now check if the sender is Player1 or Player2
    require(msg.sender == b.player1 || msg.sender == b.player2, "Not a participant");

    if (msg.sender == b.player1) {
        require(!b.player1Staked, "Player1 already staked");
        b.player1Staked = true;
    } else {
        require(!b.player2Staked, "Player2 already staked");
        b.player2Staked = true;
    }
}




    // ✅ Only the contract owner can declare the winner
    function declareWinner(uint256 _battleId, address _winner) external onlyOwner {
        Battle storage b = battles[_battleId];
        require(b.player1Staked && b.player2Staked, "Both players must stake");
        require(!b.finished, "Battle already finished");
        require(_winner == b.player1 || _winner == b.player2, "Invalid winner");

        b.winner = _winner;
        b.finished = true;
        
        // Distribute pot
        uint256 pot = b.stake * 2;
        (bool success, ) = _winner.call{value: pot}("");
        require(success, "Transfer to winner failed");
    }
}
