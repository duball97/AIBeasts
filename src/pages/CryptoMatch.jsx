import { useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { supabase } from "../supabaseClient"; // Your Supabase client
import { VortexConnectContext } from "../VortexConnectContext";
import "./CryptoMatch.css";
import BattleBetABI from "../contracts/BattleBet.json";

// Define your contract addresses using Vite’s environment variables
const CONTRACT_ADDRESSES = {
  1: "", // Ethereum Mainnet (if needed)
  11155111: import.meta.env.VITE_SEPOLIA_BATTLE_CONTRACT, // Sepolia BattleBet Contract (e.g. "0xff9f97c2eBDf33DCB13A558663fA35408dEbFe2a")
  8453: "", // Base Testnet (if needed)
};

// ABI for the createBattle function – note that it is nonpayable (so do NOT send ETH)
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
];

const CryptoMatch = () => {
  const [lobbies, setLobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingLobby, setCreatingLobby] = useState(false);
  const [lobbyName, setLobbyName] = useState("");
  const [lobbyConditions, setLobbyConditions] = useState("");
  const [stakeAmount, setStakeAmount] = useState(""); // Stake amount input (in ETH)

  // Wallet connection via VortexConnect
  const { address: walletAddress, isConnected, chainId, connectMetaMask } =
    useContext(VortexConnectContext);

  // Helper: Get the user ID from the JWT token stored in localStorage.
  const getUserId = () => {
    try {
      const token = localStorage.getItem("aibeasts_token");
      if (!token) throw new Error("No token found.");
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      return decodedToken.id;
    } catch (err) {
      console.error("Error extracting user ID:", err.message);
      return null;
    }
  };

  // Helper: Fetch the wallet address from aibeasts_users for the given user ID.
  const fetchUserWallet = async (userId) => {
    const { data, error } = await supabase
      .from("aibeasts_users")
      .select("wallet")
      .eq("id", userId)
      .single();
    if (error) {
      console.error("Error fetching wallet:", error.message);
      return "";
    }
    return data.wallet;
  };

  // Fetch all crypto betting lobbies:
  // Only show lobbies that are open and have a bet_amount > 0.
  const fetchLobbies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("aibeasts_lobbies")
      .select("*")
      .eq("lobby_status", "open")
      .gt("bet_amount", 0)
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setLobbies(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLobbies();
  }, []);

  // Create a new crypto betting lobby.
  // IMPORTANT: This function first interacts with the contract (which does NOT receive ETH because createBattle is nonpayable)
  // then saves the lobby record (including the on-chain battle ID) in Supabase.
  const handleCreateLobby = async () => {
    try {
      if (!isConnected) await connectMetaMask();
      if (!walletAddress) {
        setError("Wallet not connected!");
        return;
      }
      if (!chainId || !CONTRACT_ADDRESSES[chainId]) {
        setError("Unsupported network! Please switch to Sepolia.");
        return;
      }
      if (!stakeAmount || isNaN(stakeAmount) || parseFloat(stakeAmount) <= 0) {
        setError("Invalid stake amount.");
        return;
      }
  
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESSES[chainId], BattleBetABI.abi, signer);
  
      const stakeWei = ethers.parseEther(stakeAmount);
  
      console.log(`Creating battle with stake: ${stakeWei.toString()} Wei`);
  
      // Step 1: Call createBattle (no ETH sent)
      const createTx = await contract.createBattle("0x0000000000000000000000000000000000000000", stakeWei);
      console.log("Transaction sent:", createTx.hash);
      await createTx.wait();
      console.log("Battle successfully created on-chain!");
  
      // Step 2: Fetch the latest battle ID
      const battleCounter = await contract.battleCounter();
      const battleId = battleCounter.toString();
      console.log(`Battle ID: ${battleId}`);
  
      // Step 3: Player 1 Joins the Battle (Sends ETH)
      console.log(`Player1 (${walletAddress}) joining battle #${battleId} with ${stakeWei.toString()} Wei`);
      const joinTx = await contract.joinBattle(battleId, { value: stakeWei });
      console.log("Joining transaction sent:", joinTx.hash);
      await joinTx.wait();
      console.log(`Player1 joined battle #${battleId}!`);
  
      // Step 4: Save the lobby in Supabase and mark it as "open"
      const { data, error } = await supabase
        .from("aibeasts_lobbies")
        .insert([
          {
            created_by: walletAddress,
            lobby_name: lobbyName,
            conditions: lobbyConditions,
            bet_amount: stakeAmount,
            creator_wallet: walletAddress,
            battlecontract_id: battleId,
            lobby_status: "open", 
          },
        ])
        .single();
  
      if (error) setError(error.message);
      else {
        console.log("Battle saved in database!");
        fetchLobbies();
        setCreatingLobby(false);
        setLobbyName("");
        setLobbyConditions("");
        setStakeAmount("");
      }
    } catch (err) {
      console.error("Error creating and joining battle:", err);
      setError("Transaction failed. Please try again.");
    }
  };
  
  

  // When a user clicks "Join Lobby", redirect them to the crypto battle page.
  const handleJoinLobby = (lobbyId) => {
    window.location.href = `/crypto-match-battle?lobbyId=${lobbyId}`;
  };

  return (
    <div className="crypto-match-page">
      <h2>Crypto Betting Lobby</h2>
      <p>Find a crypto betting match or create your own lobby!</p>

      <button className="custom-button" onClick={() => setCreatingLobby(true)}>
        Create New Lobby
      </button>

      {creatingLobby && (
        <div className="create-lobby-form">
          <input
            type="text"
            placeholder="Lobby Name"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
          />
          <textarea
            placeholder="Set match conditions (e.g., minimum experience, beast type, etc.)"
            value={lobbyConditions}
            onChange={(e) => setLobbyConditions(e.target.value)}
          />
          <input
            type="text"
            placeholder="Bet Amount (ETH)"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
          />
          <button className="custom-button" onClick={handleCreateLobby}>
            Create Lobby
          </button>
          <button className="custom-button" onClick={() => setCreatingLobby(false)}>
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading lobbies...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="lobby-list">
          {lobbies.length === 0 ? (
            <p>No open crypto betting lobbies available at the moment.</p>
          ) : (
            lobbies.map((lobby) => (
              <div key={lobby.id} className="lobby-item">
                <h3>{lobby.lobby_name}</h3>
                <p><strong>Created by:</strong> {lobby.created_by}</p>
                <p><strong>Conditions:</strong> {lobby.conditions}</p>
                <p><strong>Bet Amount:</strong> {lobby.bet_amount} ETH</p>
                <p><strong>Creator Wallet:</strong> {lobby.creator_wallet}</p>
                <button className="custom-button" onClick={() => handleJoinLobby(lobby.id)}>
                  Join Lobby
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CryptoMatch;
