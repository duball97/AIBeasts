import React, { useState, useEffect } from "react";
import TerminalChat from "./TerminalChat";
import { supabase } from "../../supabaseClient"; // Your Supabase client
import "./BattleArena.css";

const BattleArena = () => {
  const [userBeast, setUserBeast] = useState(null);
  const [aiBeast, setAiBeast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserBeast = async () => {
    try {
      const token = localStorage.getItem("aibeasts_token");
  
      if (!token) {
        throw new Error("No token found. Please log in to view your beast.");
      }
  
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT
      const { id: userId } = decodedToken;
  
      console.log("🔍 Fetching from Supabase with user ID:", userId);
  
      const { data, error } = await supabase
        .from("aibeasts_characters")
        .select("*")  // Fetch ALL columns to avoid missing data
        .eq("user_id", userId)
        .single();
  
      console.log("📊 Supabase Response:", { data, error }); // ✅ LOG THIS
  
      if (error) throw new Error(error.message);
      if (!data) throw new Error("No monster found for this user.");
  
      return data;
    } catch (err) {
      console.error("❌ Error fetching user beast:", err.message);
      throw err;
    }
  };
  
  

  const fetchAiBeast = async () => {
    try {
      const { data, error } = await supabase
        .from("aibeasts_characters")
        .select("*")
        .eq("user_id", "46de16fa-1305-41de-97c4-e570d164c0b8") // AI Beast's hardcoded user_id
        .single();

      if (error || !data) {
        throw new Error("Failed to fetch AI beast from Supabase.");
      }

      return data;
    } catch (err) {
      console.error("Error fetching AI beast:", err.message);
      throw err;
    }
  };

  useEffect(() => {
    const loadBeasts = async () => {
      try {
        setLoading(true);
        const userBeastData = await fetchUserBeast();
        const aiBeastData = await fetchAiBeast();

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

  if (loading) {
    return <div className="battle-arena">Loading beasts... 🕒</div>;
  }

  if (error) {
    return <div className="battle-arena error">{error}</div>;
  }

  return (
    <div className="battle-arena">
      <TerminalChat userBeast={userBeast} aiBeast={aiBeast} />
    </div>
  );
};

export default BattleArena;
