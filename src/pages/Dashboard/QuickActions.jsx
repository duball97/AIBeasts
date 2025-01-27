// src/components/Dashboard/QuickActions.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./QuickActions.css"; // Ensure this CSS file exists

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="actions-grid">
        <button className="action-button" onClick={() => navigate("/matchmaking")}>
          Start a Battle
        </button>
        <button className="action-button" onClick={() => navigate("/train")}>
          Train a Monster
        </button>
        <button
          className="action-button"
          onClick={() => alert("Visit Marketplace clicked!")}
        >
          Visit Marketplace
        </button>
        <button
          className="action-button"
          onClick={() => alert("Join a Tournament clicked!")}
        >
          Join a Tournament
        </button>
        {/* Add more actions as needed */}
      </div>
    </div>
  );
};

export default QuickActions;
