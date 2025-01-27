// src/components/MonsterInfo.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import "./MonsterInfo.css";

const MonsterInfo = () => {
  const [monster, setMonster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        const decodedToken = token ? JSON.parse(atob(token.split(".")[1])) : {};
        const { id } = decodedToken;

        console.log("Decoded token:", decodedToken);
        console.log("User ID extracted from token:", id);

        if (!id) {
          console.error("Invalid token. Could not extract user ID.");
          setError("Invalid token. Unable to fetch monster data.");
          setLoading(false);
          return;
        }

        console.log("Fetching monster data from Supabase for user ID:", id);
        const { data, error } = await supabase
          .from("aibeasts_characters")
          .select("name, image_url, abilities, personality")
          .eq("user_id", id)
          .single();

        console.log("Supabase Response:", { data, error });

        if (error || !data) {
          console.error("Error fetching monster data:", error?.message);
          setError("Failed to fetch monster data.");
        } else {
          // Safely parse `personality` if it is a string
          let parsedPersonality = [];
          if (typeof data.personality === "string") {
            try {
              parsedPersonality = JSON.parse(data.personality);
              if (!Array.isArray(parsedPersonality)) {
                console.warn("Parsed personality is not an array. Defaulting to empty array.");
                parsedPersonality = [];
              }
            } catch (parseError) {
              console.error("Error parsing personality:", parseError.message);
              parsedPersonality = [];
            }
          }

          setMonster({
            name: data.name,
            image: data.image_url || "/default-monster.png",
            personality: parsedPersonality.length > 0 ? parsedPersonality.join(", ") : "No personality traits yet",
            abilities: data.abilities || [],
          });

          console.log("Monster data retrieved successfully:", data);
        }
      } catch (err) {
        console.error("Unexpected error during fetch:", err.message);
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
      <img src={monster.image} alt={monster.name} className="monster-image" />
      <div className="info">
        <h2>{monster.name}</h2>
        <p><strong>Personality:</strong> {monster.personality}</p>
        <p><strong>Abilities:</strong> {monster.abilities.length > 0 ? monster.abilities.join(", ") : "None"}</p>
      </div>
    </div>
  );
};

export default MonsterInfo;
