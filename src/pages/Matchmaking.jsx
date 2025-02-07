import React from "react";
import { useNavigate } from "react-router-dom";
import "./Matchmaking.css"; 

const Matchmaking = () => {
  const navigate = useNavigate();

  return (
    <div className="matchmaking-page">
      <div className="matchmaking-header">
        <h2 className="matchmaking-title">Choose Your Battle Mode</h2>
        <p className="matchmaking-subtitle">Test your beast's strength in battle.</p>
      </div>

      <div className="matchmaking-options">
        <button className="matchmaking-button" onClick={() => navigate("/online-match")}>
          Play Online
        </button>
        <button className="matchmaking-button" onClick={() => navigate("/arena")}>
          Play Against AI
        </button>
      </div>
    </div>
  );
};

export default Matchmaking;
