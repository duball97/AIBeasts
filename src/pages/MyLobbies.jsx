// src/pages/MyLobbies.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // Your Supabase client
import { useNavigate } from "react-router-dom";
import "./OnlineMatch.css";

const MyLobbies = () => {
  const [lobbies, setLobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Helper function to extract the current user's ID from the token.
  const getUserId = () => {
    try {
      const token = localStorage.getItem("aibeasts_token");
      if (!token) return null;
      const decoded = JSON.parse(atob(token.split(".")[1]));
      return decoded.id;
    } catch (err) {
      console.error("Error decoding token:", err);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        if (!userId) {
          setError("User not authenticated.");
          setLoading(false);
          return;
        }

        // 1. Fetch all lobbies created by the current user.
        const { data: lobbyData, error: lobbyError } = await supabase
          .from("aibeasts_lobbies")
          .select("*")
          .eq("created_by", userId)
          .order("created_at", { ascending: false });

        if (lobbyError) {
          throw new Error(lobbyError.message);
        }

        // 2. For each lobby, fetch the corresponding battle record (using .limit(1).maybeSingle())
        const updatedLobbies = await Promise.all(
          lobbyData.map(async (lobby) => {
            const { data: battleData, error: battleErr } = await supabase
              .from("aibeasts_battles")
              .select("*")
              .eq("lobby_id", lobby.id)
              .limit(1)
              .maybeSingle();

            if (battleErr) {
              // If error is "no rows", battleData will be null.
              throw new Error(battleErr.message);
            }
            return { ...lobby, battle: battleData }; // battleData is null if no battle record exists.
          })
        );

        setLobbies(updatedLobbies);
      } catch (err) {
        console.error("Error in MyLobbies:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading your lobbies...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="my-lobbies-page">
      <h2>My Lobbies</h2>
      {lobbies.length === 0 ? (
        <p>You have not created any lobbies yet.</p>
      ) : (
        lobbies.map((lobby) => (
          <div key={lobby.id} className="lobby-item">
            <h3>{lobby.lobby_name}</h3>
            <p>
              <strong>Conditions:</strong> {lobby.conditions}
            </p>
            {lobby.battle ? (
              <button onClick={() => navigate(`/lobby-battle?battleId=${lobby.battle.id}`)}>
                Start Fight
              </button>
            ) : (
              <p>No player accepted yet.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MyLobbies;
