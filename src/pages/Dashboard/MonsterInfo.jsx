// src/components/Dashboard/MonsterInfo.jsx
import React from 'react';
import './MonsterInfo.css'; // Ensure this CSS file exists

const MonsterInfo = ({ monster }) => {
  return (
    <div className="monster-info">
      <img src={monster.image} alt={monster.name} className="monster-image" />
      <div className="info">
        <h2>{monster.name}</h2>
        <p><strong>Personality:</strong> {monster.personality}</p>
        <p><strong>Abilities:</strong> {monster.abilities.join(', ')}</p>
        <p><strong>Strengths:</strong> {monster.strengths.join(', ')}</p>
        <p><strong>Weaknesses:</strong> {monster.weaknesses.join(', ')}</p>
        {/* Add more dynamic info as needed */}
      </div>
    </div>
  );
};

export default MonsterInfo;
