// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract BattleBet {
    
    struct Battle {
        address player1;
        address player2;
        uint256 stake;        // stake amount (in wei or in tokens)
        bool player1Staked;
        bool player2Staked;
        address winner;
        bool finished;
        // you can store more info like which token is used, etc.
    }

    // Keep an auto-incrementing ID or a way to identify battles
    uint256 public battleCounter;
    mapping (uint256 => Battle) public battles;

    // For simplicity, assume bets are in the native token (ETH on Base).
    // For ERC-20 tokens, you'd integrate with an ERC-20 token contract.
    
    // Create a new battle
    function createBattle(address _player2, uint256 _stake) external returns (uint256) {
        battleCounter++;
        // initialize new Battle struct
        Battle storage b = battles[battleCounter];
        b.player1 = msg.sender;
        b.player2 = _player2;
        b.stake = _stake;
        
        return battleCounter;
    }

    // Join the battle (player1 calls too, or you can do it in createBattle)
    function joinBattle(uint256 _battleId) external payable {
        Battle storage b = battles[_battleId];
        require(msg.value == b.stake, "Must send correct stake");
        require(
            msg.sender == b.player1 || msg.sender == b.player2,
            "Not a participant"
        );

        if (msg.sender == b.player1) {
            require(!b.player1Staked, "Player1 already staked");
            b.player1Staked = true;
        } else {
            require(!b.player2Staked, "Player2 already staked");
            b.player2Staked = true;
        }
    }

    // Declare the winner after the off-chain logic concludes
    function declareWinner(uint256 _battleId, address _winner) external {
        // Optional: Add access control so only your game server or 
        // a verified mechanism can call it. For example:
        // require(msg.sender == owner, "Only game server can call");

        Battle storage b = battles[_battleId];
        require(b.player1Staked && b.player2Staked, "Both players must stake");
        require(!b.finished, "Battle already finished");
        require(_winner == b.player1 || _winner == b.player2, "Invalid winner");

        b.winner = _winner;
        b.finished = true;
        
        // Distribute pot
        uint256 pot = b.stake * 2; // simple 1 vs 1 scenario
        (bool success, ) = _winner.call{value: pot}("");
        require(success, "Transfer to winner failed");
    }
}
