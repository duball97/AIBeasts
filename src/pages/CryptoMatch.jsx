import { useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { supabase } from "../supabaseClient"; // Your Supabase client
import { VortexConnectContext } from "../VortexConnectContext";
import "./CryptoMatch.css";
import BattleBetABI from "../contracts/BattleBet.json";

// Define your contract addresses using Vite’s environment variables
const CONTRACT_ADDRESSES = {
  11155111: import.meta.env.VITE_SEPOLIA_BATTLE_CONTRACT, // Sepolia
  8453: "0xf2EB32A53ec36a7b7D52256E940c0311f613E0Ec", // Base
  42170: "0x4CAA8b4845F3dB19Dc67E394cc686eFd6116ef64", // Arbitrum
};

const CryptoMatch = () => {
  const [lobbies, setLobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingLobby, setCreatingLobby] = useState(false);
  const [lobbyName, setLobbyName] = useState("");
  const [lobbyConditions, setLobbyConditions] = useState("");
  const [stakeAmount, setStakeAmount] = useState(""); // Stake amount input (in ETH)

  // Wallet connection via VortexConnect
  const {
    address: walletAddress,
    isConnected,
    chainId,
    connectMetaMask,
  } = useContext(VortexConnectContext);

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

  // Map of Chain IDs to Chain Names
const CHAIN_NAMES = {
  1: "Ethereum Mainnet",
  11155111: "Sepolia",
  8453: "Base",
  42170: "Arbitrum",
  56: "Binance Smart Chain",
 
};

// Convert Chain ID to Chain Name
const getChainName = (chainId) => {
  return CHAIN_NAMES[chainId] || `Unknown (${chainId})`;
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

  const [creatingLobbyLoading, setCreatingLobbyLoading] = useState(false);

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
  
      setCreatingLobbyLoading(true); // ✅ Start loading
  
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES[chainId],
        BattleBetABI.abi,
        signer
      );
  
      const stakeWei = ethers.parseEther(stakeAmount);
      console.log(`Creating battle with stake: ${stakeWei.toString()} Wei`);
  
      const createTx = await contract.createAndJoinBattle({
        value: stakeWei,
        gasLimit: 300000,
      });
      console.log("Transaction sent:", createTx.hash);
      await createTx.wait();
      console.log("Battle successfully created and Player1 has joined!");
  
      const battleCounter = await contract.battleCounter();
      const battleId = battleCounter.toString();
      console.log(`Battle ID: ${battleId}`);
  
      const userId = getUserId(); // ✅ Get user ID
  
      // ✅ Fetch user's beast picture
      const { data: userBeastData, error: userBeastError } = await supabase
        .from("aibeasts_characters")
        .select("image_url")
        .eq("user_id", userId)
        .single();
  
      if (userBeastError) console.warn("⚠️ Could not fetch user beast picture.");
  
      const player1Pic = userBeastData?.image_url || null; // ✅ Save beast image
  
      // ✅ Insert into Supabase, including chainId
      const { error } = await supabase
        .from("aibeasts_lobbies")
        .insert([
          {
            created_by: userId, // ✅ Save user ID instead of wallet
            lobby_name: lobbyName,
            conditions: lobbyConditions,
            bet_amount: stakeAmount,
            creator_wallet: walletAddress,
            battlecontract_id: battleId,
            player1_pic: player1Pic, // ✅ Save beast image
            player2_wallet: null,
            lobby_status: "open",
            chain: chainId.toString(), // ✅ Save chainId as a string
          },
        ])
        .single();
  
      if (error) {
        setError(error.message);
      } else {
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
    } finally {
      setCreatingLobbyLoading(false); // ✅ Stop loading
    }
  };
  

  const [joiningLobbyLoading, setJoiningLobbyLoading] = useState(false);

  const handleJoinLobby = async (lobbyId) => {
    try {
      if (!isConnected) await connectMetaMask();
      if (!walletAddress) {
        setError("Wallet not connected!");
        return;
      }

      setJoiningLobbyLoading(true); // ✅ Start loading

      console.log("Fetching battlecontract_id for lobbyId:", lobbyId);

      const { data: lobbyData, error: lobbyError } = await supabase
        .from("aibeasts_lobbies")
        .select("battlecontract_id, creator_wallet, bet_amount")
        .eq("id", lobbyId)
        .maybeSingle();

      if (lobbyError || !lobbyData || !lobbyData.battlecontract_id) {
        console.error(
          "Error fetching battlecontract_id:",
          lobbyError?.message || "Not found"
        );
        setError("Failed to retrieve battlecontract_id.");
        return;
      }

      const battlecontractId = lobbyData.battlecontract_id;
      const creatorWallet = lobbyData.creator_wallet;
      const stakeAmount = lobbyData.bet_amount;

      console.log("Correct battlecontract_id:", battlecontractId);
      console.log("Lobby created by (Player1):", creatorWallet);

      if (walletAddress.toLowerCase() === creatorWallet.toLowerCase()) {
        console.error("You are Player1 and have already staked!");
        setError("You have already staked. Wait for an opponent.");
        return;
      }

      if (!stakeAmount || isNaN(parseFloat(stakeAmount))) {
        console.error("Invalid stake amount:", stakeAmount);
        setError("Invalid stake amount.");
        return;
      }

      const stakeWei = ethers.parseEther(stakeAmount.toString());
      console.log(
        `Player2 (${walletAddress}) joining battle #${battlecontractId} with ${stakeWei.toString()} Wei`
      );

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES[chainId],
        BattleBetABI.abi,
        signer
      );

      const joinTx = await contract.joinExistingBattle(battlecontractId, {
        value: stakeWei,
        gasLimit: 100000,
      });
      console.log("Joining transaction sent:", joinTx.hash);
      await joinTx.wait();
      console.log(`Player2 joined battle #${battlecontractId}!`);

      const userId = getUserId(); // ✅ Get user ID

      // ✅ Fetch user's beast picture
      const { data: userBeastData, error: userBeastError } = await supabase
        .from("aibeasts_characters")
        .select("image_url")
        .eq("user_id", userId)
        .single();

      if (userBeastError)
        console.warn("⚠️ Could not fetch user beast picture.");

      const player2Pic = userBeastData?.image_url || null; // ✅ Save beast image

      const { error: updateStatusError } = await supabase
        .from("aibeasts_lobbies")
        .update({
          lobby_status: "ongoing",
          player2_wallet: walletAddress,
          player2_pic: player2Pic, // ✅ Save Player2's beast image
        })
        .eq("battlecontract_id", battlecontractId);

      if (updateStatusError) {
        setError(updateStatusError.message);
      } else {
        console.log("Lobby status updated to 'ongoing'!");
        fetchLobbies();
      }

      console.log(`Redirecting Player2 to battle arena...`);
      window.location.href = `/battle-arena-online?lobbyId=${lobbyId}`;
    } catch (err) {
      console.error("Error joining battle:", err);
      setError("Transaction failed. Please try again.");
    } finally {
      setJoiningLobbyLoading(false); // ✅ Stop loading
    }
  };

  return (
    <div className="crypto-match-page">
      <h2>Betting Matches</h2>
      <p>Find a betting match or create your own lobby by betting your chosen amount and waiting for a player to join.</p>
      <p className="small-info-text">
  You need a crypto wallet to play. If you don't have one, play the free match instead or create one.
</p>

      <button
        className="centered2-button"
        onClick={() => setCreatingLobby(true)}
        disabled={creatingLobbyLoading}
        style={{ marginTop: "20px" }}
      >
        {creatingLobbyLoading ? "Creating..." : "Create Lobby"}
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
          <button
            className="custom-button"
            onClick={() => setCreatingLobby(false)}
            style={{ marginTop: "-10px" }}
          >
            Cancel
          </button>
        </div>
      )}
  
      {loading ? (
        <p>Loading lobbies...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="lobby-grid"> {/* ✅ Updated to use grid for 3 per row */}
          {lobbies.length === 0 ? (
            <p>No open crypto betting lobbies available at the moment.</p>
          ) : (
            lobbies.map((lobby) => (
              <div key={lobby.id} className="lobby-item">
                {lobby.player1_pic ? (
                  <img
                    src={lobby.player1_pic}
                    alt="Player 1 Beast"
                    className="player1-image"
                  />
                ) : (
                  <img
                    src="./assets/logo.png"
                    alt="Default Beast"
                    className="player1-image"
                  />
                )}
                <button
                  className="custom-button"
                  onClick={() => handleJoinLobby(lobby.id)}
                  disabled={joiningLobbyLoading}
                >
                  {joiningLobbyLoading ? "Joining..." : "Join Lobby"}
                </button>
                <h3>{lobby.lobby_name}</h3>
               
                <p><strong>Bet Amount:</strong> {lobby.bet_amount} ETH</p>
                <p><strong>Chain:</strong> {getChainName(lobby.chain)}</p>
               
                <div style={{ marginTop: "20px" }}>
                <p><strong>Conditions:</strong> {lobby.conditions}</p>
                  <p className="text-sm">You are betting real funds.</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
  
};

export default CryptoMatch;
