// src/components/Dashboard/QuickStats.jsx
import React from 'react';
import './QuickStats.css'; // Ensure this CSS file exists

const QuickStats = ({ stats }) => {
  return (
    <div className="quick-stats">
      <h3>Quick Stats</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <p>Monsters</p>
          <span>{stats.totalMonsters}</span>
        </div>
        <div className="stat-item">
          <p>Battles</p>
          <span>{stats.battlesParticipated}</span>
        </div>
        <div className="stat-item">
          <p>Wins</p>
          <span>{stats.wins}</span>
        </div>
       
        <div className="stat-item">
          <p>Balance</p>
          <span>{stats.cryptoBalance}</span>
        </div>
        {/* Add more stats as needed */}
      </div>
    </div>
  );
};

export default QuickStats;
