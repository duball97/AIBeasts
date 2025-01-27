// src/pages/Matchmaking.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Matchmaking.css"; // Optional CSS for the matchmaking page

const Matchmaking = () => {
  const navigate = useNavigate();

  return (
    <div className="matchmaking-page">
      <h2>Choose Your Battle Mode</h2>
      <div className="matchmaking-options">
        <button
          className="matchmaking-button"
          onClick={() => navigate("/online-match")}
        >
          Play Online
        </button>
        <button
          className="matchmaking-button"
          onClick={() => navigate("/ai-battle")}
        >
          Play Against AI
        </button>
      </div>
    </div>
  );
};

export default Matchmaking;
