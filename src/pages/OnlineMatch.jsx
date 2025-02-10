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
      .is("bet_amount", null) // ✅ Only fetch lobbies where bet_amount is NULL
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
    const token = localStorage.getItem("aibeasts_token");
    if (!token) {
      setError("User not authenticated.");
      return;
    }
  
    let userId = null;
    try {
      const decoded = JSON.parse(atob(token.split(".")[1])); // Decode JWT
      userId = decoded.id;
    } catch (err) {
      console.error("Error decoding token:", err);
      setError("Invalid user token.");
      return;
    }
  
    // ✅ Fetch user's beast image from Supabase
    const { data: userBeast, error: beastError } = await supabase
      .from("aibeasts_characters")
      .select("image_url")
      .eq("user_id", userId)
      .single();
  
    if (beastError) {
      console.warn("⚠️ Could not fetch user beast picture.");
    }
  
    const player1Pic = userBeast?.image_url || null; // ✅ Store the image
  
    // ✅ Insert new lobby into Supabase with player1_pic
    const { error } = await supabase
      .from("aibeasts_lobbies")
      .insert([
        {
          created_by: userId,
          lobby_name: lobbyName,
          conditions: lobbyConditions,
          lobby_status: "open",
          player1_pic: player1Pic, // ✅ Store Player 1's image
        },
      ])
      .single();
  
    if (error) {
      setError(error.message);
    } else {
      fetchLobbies();
      setCreatingLobby(false);
      setLobbyName("");
      setLobbyConditions("");
    }
  };
  

  // Join lobby function
  const handleJoinLobby = (lobbyId) => {
    window.location.href = `/battle-arena-online?lobbyId=${lobbyId}`;
  };

  return (
    <div className="online-match-page">
      <h2>Free Online Match</h2>
      <p>Find an opponent or create your own match!</p>

      <button className="centered2-button" onClick={() => setCreatingLobby(true)}>
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
          <button className="custom-button" onClick={handleCreateLobby}>
            Create Lobby
          </button>
          <button className="custom-button cancel-btn" onClick={() => setCreatingLobby(false)}>
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading lobbies...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="lobby-grid"> {/* ✅ Grid layout for 3 lobbies per row */}
          {lobbies.length === 0 ? (
            <p>No open lobbies available at the moment.</p>
          ) : (
            lobbies.map((lobby) => (
              <div key={lobby.id} className="lobby-item">
                <img
                  src={lobby.player1_pic || "./assets/default-avatar.png"} // ✅ Show Player 1 image
                  alt="Player 1 Beast"
                  className="player1-image"
                />
                <button className="join-lobby-btn" onClick={() => handleJoinLobby(lobby.id)} style={{ marginTop: "10px", marginBottom:"10px", }}>
                  Join Lobby
                </button>
                <h3>{lobby.lobby_name}</h3>
                
                <p><strong>Conditions:</strong> {lobby.conditions}</p>
               
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OnlineMatch;
