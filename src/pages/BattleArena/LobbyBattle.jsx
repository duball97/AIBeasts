// src/pages/LobbyBattle.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import TerminalChatReplay from "./TerminalChatReplay";
import VisualArena from "./VisualArena";
import "./BattleArenaOnline.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const LobbyBattle = () => {
  const query = useQuery();
  const battleId = query.get("battleId");

  const [battle, setBattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBattle = async () => {
      try {
        setLoading(true);
        if (!battleId) throw new Error("Battle ID is missing in URL.");

        const { data, error } = await supabase
          .from("aibeasts_battles")
          .select("*")
          .eq("id", battleId)
          .single();

        if (error || !data) {
          throw new Error(error?.message || "Battle record not found.");
        }
        setBattle(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBattle();
  }, [battleId]);

  if (loading) return <div className="battle-arena-online">Loading battle replay... 🕒</div>;
  if (error) return <div className="battle-arena-online error">{error}</div>;

  // Simulate beast objects from the battle record.
  const simulatedUserBeast = { name: battle.character_1, image_url: null };
  const simulatedOpponentBeast = { name: battle.character_2, image_url: null };

  return (
    <div className="battle-arena-online">
      <div className="battle-arena-content">
        <div className="terminal-column">
          <TerminalChatReplay
            savedBattleLog={battle.battle_log} 
            winnerExplanation={battle.winner_explanation || battle.winnerExplanation}
          />
        </div>
        <div className="visual-column">
          <VisualArena
            messages={battle.battle_log}
            userBeast={simulatedUserBeast}
            opponentBeast={simulatedOpponentBeast}
          />
        </div>
      </div>
      <div className="lobby-details">
        <p>
          <strong>Lobby ID:</strong> {battle.lobby_id}
        </p>
        <p>
          <strong>Winner:</strong> {battle.character_winner}
        </p>
      </div>
    </div>
  );
};

export default LobbyBattle;
