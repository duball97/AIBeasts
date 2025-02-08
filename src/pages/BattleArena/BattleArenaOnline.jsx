// src/pages/BattleArenaOnline.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TerminalChat from "./TerminalChat";
import VisualArena from "./VisualArena";
import { supabase } from "../../supabaseClient";
import "./BattleArenaOnline.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const BattleArenaOnline = () => {
  const query = useQuery();
  const lobbyId = query.get("lobbyId");

  const [userBeast, setUserBeast] = useState(null);
  const [opponentBeast, setOpponentBeast] = useState(null);
  const [lobbyDetails, setLobbyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: Get the user ID from the JWT token in localStorage.
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

  // Helper: Fetch beast data for a given user ID.
  const fetchBeast = async (userId) => {
    if (!userId) throw new Error("User ID is undefined.");
    try {
      const { data, error } = await supabase
        .from("aibeasts_characters")
        .select("name, personality, abilities, physic, image_url")
        .eq("user_id", userId)
        .single();
      if (error || !data) throw new Error("Failed to fetch beast data.");
      return {
        ...data,
        personality: Array.isArray(data.personality) ? data.personality : [],
        abilities: Array.isArray(data.abilities) ? data.abilities : [],
        physic: Array.isArray(data.physic) ? data.physic : [],
      };
    } catch (err) {
      console.error("Error fetching beast:", err.message);
      throw err;
    }
  };

  // Fetch lobby details from the aibeasts_lobbies table.
  const fetchLobbyDetails = async (lobbyId) => {
    try {
      const { data, error } = await supabase
        .from("aibeasts_lobbies")
        .select("*")
        .eq("id", lobbyId)
        .single();
      if (error || !data) throw new Error("Failed to fetch lobby details.");
      return data;
    } catch (err) {
      console.error("Error fetching lobby details:", err.message);
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (!lobbyId) throw new Error("Lobby ID is missing in URL.");

        // Fetch lobby details
        const lobby = await fetchLobbyDetails(lobbyId);
        setLobbyDetails(lobby);

        // Fetch opponent's beast using the lobby creator's user ID.
        const opponent = await fetchBeast(lobby.created_by);
        setOpponentBeast(opponent);

        // Fetch the joiner's beast using their own user ID.
        const userId = getUserId();
        if (!userId) throw new Error("User ID is missing.");
        const userBeastData = await fetchBeast(userId);
        setUserBeast(userBeastData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lobbyId]);

  if (loading)
    return <div className="battle-arena-online">Loading online battle... 🕒</div>;
  if (error)
    return <div className="battle-arena-online error">{error}</div>;

  return (
    <div className="battle-arena-online">
      <div className="battle-arena-content">
        <div className="terminal-column">
          {/* Pass lobbyDetails as a prop */}
          <TerminalChat 
            userBeast={userBeast} 
            aiBeast={opponentBeast} 
            lobbyDetails={lobbyDetails} 
          />
        </div>
        <div className="visual-column">
          <VisualArena 
            messages={[]} 
            userBeast={userBeast} 
            opponentBeast={opponentBeast} 
          />
        </div>
      </div>
      {lobbyDetails && (
        <div className="lobby-details">
          <p>
            <strong>Lobby:</strong> {lobbyDetails.lobby_name}
          </p>
          <p>
            <strong>Conditions:</strong> {lobbyDetails.conditions}
          </p>
        </div>
      )}
    </div>
  );
};

export default BattleArenaOnline;
