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

    address owner;
    address feeWallet;
    uint256 feePercentage = 10;


    constructor(address _feeWallet){
        owner = msg.sender;
        feeWallet = _feeWallet;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

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

    // Create and join a battle in one function (Player 1)
function createAndJoinBattle() external payable returns (uint256) {
    require(msg.value > 0, "Stake must be greater than zero");

    battleCounter++;

    // Initialize new Battle struct
    Battle storage b = battles[battleCounter];
    b.player1 = msg.sender;
    b.stake = msg.value;
    b.player1Staked = true; // First player is staking immediately

    //emit BattleCreated(battleCounter, msg.sender, msg.value);

    return battleCounter;
}

// Function to allow player2 to join an existing battle
function joinExistingBattle(uint256 _battleId) external payable {
    Battle storage b = battles[_battleId];
    require(msg.value == b.stake, "Must send correct stake");
    require(b.player2 == address(0), "Battle already has an opponent");

    // Assign the joining player as player2
    b.player2 = msg.sender;
    b.player2Staked = true;

    //emit BattleJoined(_battleId, msg.sender, msg.value);
}

// Function for Player1 to cancel a battle before Player2 joins
function cancelBattle(uint256 _battleId) external {
    Battle storage b = battles[_battleId];

    require(msg.sender == b.player1, "Only Player1 can cancel this battle");
    require(b.player2 == address(0), "Cannot cancel; player2 already joined");
    require(b.player1Staked, "No funds to refund");

    uint256 refundAmount = b.stake;
    b.stake = 0; // Prevent reentrancy exploit
    b.player1Staked = false; // Mark as refunded

    (bool success, ) = payable(b.player1).call{value: refundAmount}("");
    require(success, "Refund failed");

    //emit BattleCancelled(_battleId, b.player1);
}

    // Declare the winner after the off-chain logic concludes
function declareWinner(uint256 _battleId, address _winner) external onlyOwner {
    Battle storage b = battles[_battleId];
    require(b.player1Staked && b.player2Staked, "Both players must stake");
    require(b.winner == address(0), "Winner already declared");
    require(_winner == b.player1 || _winner == b.player2, "Invalid winner");

    b.winner = _winner;
    b.finished = true;

    uint256 pot = b.stake * 2; // Total pot from both players
    uint256 feeAmount = (pot * feePercentage) / 100; // Calculate fee
    uint256 winnerPrize = pot - feeAmount; // Remaining prize for winner

    // Send fee to the designated wallet
    (bool feeSent, ) = payable(feeWallet).call{value: feeAmount}("");
    require(feeSent, "Fee transfer failed");

    // Send the remaining prize to the winner
    (bool prizeSent, ) = payable(_winner).call{value: winnerPrize}("");
    require(prizeSent, "Winner transfer failed");

    //emit BattleWon(_battleId, _winner, winnerPrize, feeAmount);
}

// Event for tracking winners
//event BattleWon(uint256 indexed battleId, address indexed winner, uint256 prize, uint256 fee);

}
