// src/pages/CryptoMatch.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // Your Supabase client
import "./CryptoMatch.css";

const CryptoMatch = () => {
  const [lobbies, setLobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingLobby, setCreatingLobby] = useState(false);
  const [lobbyName, setLobbyName] = useState("");
  const [lobbyConditions, setLobbyConditions] = useState("");
  const [stakeAmount, setStakeAmount] = useState(""); // stake input (in ETH)
  const [creatorWallet, setCreatorWallet] = useState(""); // creator's wallet address

  // Fetch all crypto betting lobbies: we show only those with bet_amount > 0
  const fetchLobbies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("aibeasts_lobbies")
      .select("*")
      .eq("lobby_status", "open")
      .gt("bet_amount", 0) // only include lobbies where bet_amount > 0
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
  const handleCreateLobby = async () => {
    // Get the user ID from the JWT token stored in localStorage
    const token = localStorage.getItem("aibeasts_token");
    if (!token) {
      setError("User not authenticated.");
      return;
    }
    let userId = null;
    try {
      const decoded = JSON.parse(atob(token.split(".")[1])); // decode JWT
      userId = decoded.id;
    } catch (err) {
      console.error("Error decoding token:", err);
      setError("Invalid user token.");
      return;
    }

    // Insert the new lobby into aibeasts_lobbies.
    // We now save the bet_amount and creator_wallet instead of lobby_mode.
    const { data, error } = await supabase
      .from("aibeasts_lobbies")
      .insert([
        {
          created_by: userId,
          lobby_name: lobbyName,
          conditions: lobbyConditions,
          stake: stakeAmount,         // You may or may not need this duplicate field
          bet_amount: stakeAmount,      // Save the bet amount (numeric)
          creator_wallet: creatorWallet, // Save the creator's wallet address
          lobby_status: "open",
        },
      ])
      .single();

    if (error) {
      setError(error.message);
    } else {
      // Refresh the lobby list and hide the creation form.
      fetchLobbies();
      setCreatingLobby(false);
      setLobbyName("");
      setLobbyConditions("");
      setStakeAmount("");
      setCreatorWallet("");
    }
  };

  // When a user clicks "Join Lobby", redirect them to the crypto battle page.
  const handleJoinLobby = (lobbyId) => {
    // For example, navigate to /crypto-match-battle?lobbyId=...
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
            placeholder="Stake Amount (ETH)"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Your Wallet Address"
            value={creatorWallet}
            onChange={(e) => setCreatorWallet(e.target.value)}
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
                <p>
                  <strong>Created by:</strong> {lobby.created_by}
                </p>
                <p>
                  <strong>Conditions:</strong> {lobby.conditions}
                </p>
                <p>
                  <strong>Stake:</strong> {lobby.stake} ETH
                </p>
                <p>
                  <strong>Bet Amount:</strong> {lobby.bet_amount} ETH
                </p>
                <p>
                  <strong>Creator Wallet:</strong> {lobby.creator_wallet}
                </p>
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
