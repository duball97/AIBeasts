// src/components/VisualArena.jsx
import React, { useEffect, useState, useRef } from 'react';
import './VisualArena.css';

// Optional fallback images if beast.image_url is missing
import fallbackMonster1 from '../../assets/monster1.png';
import fallbackMonster2 from '../../assets/monster2.png';
// Import the arena background image (adjust path if needed)
import arenaBg from '../../assets/arena.png';

const VisualArena = ({ messages, userBeast, opponentBeast }) => {
  // Animation states for each beast
  const [userAttacking, setUserAttacking] = useState(false);
  const [opponentAttacking, setOpponentAttacking] = useState(false);
  // Use a ref to track the number of attacks (each attack is one turn)
  const attackCountRef = useRef(0);
  // Total attacks: 5 rounds × 2 attacks per round = 10 attacks
  const totalAttacks = 10;

  useEffect(() => {
    const interval = setInterval(() => {
      // If we've reached the total attacks, clear the interval
      if (attackCountRef.current >= totalAttacks) {
        clearInterval(interval);
        return;
      }

      // Alternate: even attack counts (0, 2, 4, ...) are user's turn,
      // odd attack counts (1, 3, 5, ...) are opponent's turn.
      if (attackCountRef.current % 2 === 0) {
        setUserAttacking(true);
        // Remove the animation class after 500ms (adjust as needed)
        setTimeout(() => setUserAttacking(false), 500);
      } else {
        setOpponentAttacking(true);
        setTimeout(() => setOpponentAttacking(false), 500);
      }
      attackCountRef.current += 1;
    }, 3000); // Every 3 seconds, an attack occurs.

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="visual-arena"
      style={{ backgroundImage: `url(${arenaBg})` }}
    >
      {/* Container for Player 1's beast (joiner) positioned at bottom left */}
      <div className="monster-container monster1-container">
        <img
          src={userBeast?.image_url || fallbackMonster1}
          alt={userBeast?.name || "Monster 1"}
          className={`monster monster1 ${userAttacking ? 'user-attacking' : ''}`}
        />
        <div className="monster-label">
          {userBeast?.name}
          {userBeast?.username ? ` - ${userBeast.username}` : ""}
        </div>
      </div>
      
      {/* Container for Player 2's beast (opponent) positioned at top right */}
      <div className="monster-container monster2-container">
        <img
          src={opponentBeast?.image_url || fallbackMonster2}
          alt={opponentBeast?.name || "Monster 2"}
          className={`monster monster2 ${opponentAttacking ? 'opponent-attacking' : ''}`}
        />
        <div className="monster-label">
          {opponentBeast?.name}
          {opponentBeast?.username ? ` - ${opponentBeast.username}` : ""}
        </div>
      </div>
      
      {/* --- Optional: Remove test buttons if not needed --- */}
     
    </div>
  );
};

export default VisualArena;
