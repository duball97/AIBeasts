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
          Battle
        </button>
        <button className="action-button" onClick={() => navigate("/train")}>
          Train
        </button>
        <button
          className="action-button"
          onClick={() => alert("Visit Marketplace clicked!")}
        >
          Marketplace
        </button>
      
        {/* Add more actions as needed */}
      </div>
    </div>
  );
};

export default QuickActions;
