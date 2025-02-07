// src/pages/OnlineMatch.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // Your Supabase client
import "./OnlineMatch.css";

const OnlineMatch = () => {
  const [lobbies, setLobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingLobby, setCreatingLobby] = useState(false);
  const [lobbyName, setLobbyName] = useState("");
  const [lobbyConditions, setLobbyConditions] = useState("");

  // Fetch open lobbies from Supabase
  const fetchLobbies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("aibeasts_lobbies")
      .select("*")
      .eq("lobby_status", "open")
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

  // Create a new lobby
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

    // Insert the new lobby into aibeasts_lobbies
    const { data, error } = await supabase
      .from("aibeasts_lobbies")
      .insert([
        {
          created_by: userId,
          lobby_name: lobbyName,
          conditions: lobbyConditions,
          lobby_status: "open",
        },
      ])
      .single();

    if (error) {
      setError(error.message);
    } else {
      // Refresh the lobby list and hide the form.
      fetchLobbies();
      setCreatingLobby(false);
      setLobbyName("");
      setLobbyConditions("");
    }
  };

  // When a user clicks "Join Lobby", redirect them to the battle arena page with the lobby ID as a query parameter.
  const handleJoinLobby = (lobbyId) => {
    // For example, navigate to /battle-arena-online?lobbyId=...
    window.location.href = `/battle-arena-online?lobbyId=${lobbyId}`;
  };

  return (
    <div className="online-match-page">
      <h2>Online Lobby</h2>
      <p>Find an opponent or create your own match!</p>

      <button onClick={() => setCreatingLobby(true)}>
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
          <button onClick={handleCreateLobby}>Create Lobby</button>
          <button onClick={() => setCreatingLobby(false)}>Cancel</button>
        </div>
      )}

      {loading ? (
        <p>Loading lobbies...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="lobby-list">
          {lobbies.length === 0 ? (
            <p>No open lobbies available at the moment.</p>
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
                <button onClick={() => handleJoinLobby(lobby.id)}>
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

export default OnlineMatch;
