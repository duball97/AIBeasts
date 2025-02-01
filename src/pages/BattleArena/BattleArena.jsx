import React, { useState, useEffect } from "react";
import TerminalChat from "./TerminalChat";
import { supabase } from "../../supabaseClient"; // Your Supabase client
import "./BattleArena.css";

const BattleArena = () => {
  const [userBeast, setUserBeast] = useState(null);
  const [aiBeast, setAiBeast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔥 Fetch user ID from localStorage
  const getUserId = () => {
    try {
      const token = localStorage.getItem("aibeasts_token");
      if (!token) throw new Error("No token found.");

      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT
      return decodedToken.id; // Ensure this matches the stored user ID
    } catch (err) {
      console.error("❌ Error extracting user ID:", err.message);
      return null;
    }
  };

  const fetchBeast = async (userId) => {
    if (!userId) {
      throw new Error("User ID is undefined.");
    }

    try {
      const { data, error } = await supabase
        .from("aibeasts_characters")
        .select("name, personality, abilities, physic, image_url") // Ensure full data
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        throw new Error("Failed to fetch beast data.");
      }

      console.log("✅ Beast Data:", data);

      return {
        ...data,
        personality: Array.isArray(data.personality) ? data.personality : [],
        abilities: Array.isArray(data.abilities) ? data.abilities : [],
        physic: Array.isArray(data.physic) ? data.physic : [],
      };
    } catch (err) {
      console.error("❌ Error fetching beast:", err.message);
      throw err;
    }
  };

  useEffect(() => {
    const loadBeasts = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        if (!userId) throw new Error("User ID is missing.");

        const userBeastData = await fetchBeast(userId);
        const aiBeastData = await fetchBeast("46de16fa-1305-41de-97c4-e570d164c0b8"); // Hardcoded AI user ID

        setUserBeast(userBeastData);
        setAiBeast(aiBeastData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBeasts();
  }, []);

  if (loading) return <div className="battle-arena">Loading beasts... 🕒</div>;
  if (error) return <div className="battle-arena error">{error}</div>;

  return (
    <div className="battle-arena">
      <TerminalChat userBeast={userBeast} aiBeast={aiBeast} />
    </div>
  );
};

export default BattleArena;
