import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import "./MonsterInfo.css";
import { useNavigate } from "react-router-dom";


const MonsterInfo = () => {
  const [monster, setMonster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const navigate = useNavigate();

  useEffect(() => {
    const fetchMonster = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("aibeasts_token");
        if (!token) {
          console.error("No token found in localStorage.");
          setError("You are not logged in. Please log in to view your monster.");
          setLoading(false);
          return;
        }

        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const { id: userId } = decodedToken;
        if (!userId) {
          console.error("Invalid token. Could not extract user ID.");
          setError("Invalid token. Unable to fetch monster data.");
          setLoading(false);
          return;
        }

        console.log("Fetching monster data from Supabase for user ID:", userId);
        const { data, error } = await supabase
          .from("aibeasts_characters")
          .select("name, image_url, abilities, personality, physic")
          .eq("user_id", userId)
          .single();

        console.log("🔍 Supabase Response:", data);

        if (error || !data) {
          console.error("❌ Error fetching monster data:", error?.message);
          setError("Failed to fetch monster data.");
        } else {
          setMonster({
            name: data.name,
            image: data.image_url || "/default-monster.png",
            personality: Array.isArray(data.personality) && data.personality.length > 0
              ? data.personality.join(", ")
              : "No personality traits yet",
            abilities: Array.isArray(data.abilities) && data.abilities.length > 0
              ? data.abilities.join(", ")
              : "No abilities yet",
            physic: Array.isArray(data.physic) && data.physic.length > 0
              ? data.physic.join(", ")
              : "No physical traits yet",
          });

          console.log("✅ Monster data successfully retrieved:", data);
        }
      } catch (err) {
        console.error("❌ Unexpected error during fetch:", err.message);
        setError("An unexpected error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMonster();
  }, []);

  if (loading) {
    return <div className="monster-info">Loading your monster...</div>;
  }

  if (error) {
    return <div className="monster-info error">{error}</div>;
  }

  return (
    <div className="monster-info">
      {/* Top Section: Logo + Name on the same line */}
      <div className="monster-header">
        <img src={monster.image} alt={monster.name} className="monster-logo" />
        <h2 className="monster-name">{monster.name}</h2>
      </div>

      {/* Bottom Section: Personality, Abilities, Physic */}
      <div className="monster-details">
        <p><strong>Personality:</strong> {monster.personality}</p>
        <p><strong>Abilities:</strong> {monster.abilities}</p>
        <p><strong>Physic:</strong> {monster.physic}</p>
        <button className="action-button" onClick={() => navigate("/matchmaking")}>
         Fight
        </button>
      </div>
    </div>
  );
};

export default MonsterInfo;
