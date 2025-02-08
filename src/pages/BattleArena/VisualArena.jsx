// src/components/VisualArena.jsx
import React, { useEffect, useState } from 'react';
import './VisualArena.css';
// Optional fallback images if beast.image_url is missing
import fallbackMonster1 from '../../assets/monster1.png';
import fallbackMonster2 from '../../assets/monster2.png';

const VisualArena = ({ messages, userBeast, opponentBeast }) => {
  const [environment, setEnvironment] = useState('forest');
  const [effects, setEffects] = useState([]);

  // Listen to messages to update the environment or add attack effects
  useEffect(() => {
    if (Array.isArray(messages)) {
      messages.forEach((msg) => {
        if (msg && msg.text) {
          if (msg.text.includes('environment changes to')) {
            const newEnv = msg.text.split('environment changes to ')[1];
            setEnvironment(newEnv);
          } else if (msg.text.includes('uses')) {
            const action = msg.text.split('uses ')[1].replace('!', '');
            setEffects((prev) => [...prev, action]);
          }
        }
      });
    }
  }, [messages]);

  // Map environments to background images
  const environmentImages = {
    forest: '/environments/forest.png',
    desert: '/environments/desert.png',
    icy: '/environments/icy.png',
    // Add more environments as needed
  };

  return (
    <div
      className="visual-arena"
      style={{
        backgroundImage: `url(${environmentImages[environment] || environmentImages['forest']})`,
      }}
    >
      {/* Display the joiner's beast on the left */}
      <img
        src={userBeast?.image_url || fallbackMonster1}
        alt={userBeast?.name || "Monster 1"}
        className="monster monster1"
      />
      {/* Display the opponent's beast on the right */}
      <img
        src={opponentBeast?.image_url || fallbackMonster2}
        alt={opponentBeast?.name || "Monster 2"}
        className="monster monster2"
      />
      {/* Render any attack effects */}
      {effects.map((action, index) => (
        <div key={index} className="attack-effect">
          {action === 'FireBreath' && <div className="fire-breath"></div>}
          {action === 'Invisibility' && <div className="invisibility-effect"></div>}
          {/* Add more conditional effects based on actions */}
        </div>
      ))}
    </div>
  );
};

export default VisualArena;
