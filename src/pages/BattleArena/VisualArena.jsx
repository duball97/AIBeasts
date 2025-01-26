// src/components/VisualArena.jsx
import React, { useEffect, useState } from 'react';
import './VisualArena.css';
import monster1Img from '../../assets/monster1.png';
import monster2Img from '../../assets/monster2.png';

const VisualArena = ({ messages }) => {
  const [environment, setEnvironment] = useState('forest');
  const [effects, setEffects] = useState([]);

  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.text.includes('environment changes to')) {
        const newEnv = msg.text.split('environment changes to ')[1];
        setEnvironment(newEnv);
      } else if (msg.text.includes('uses')) {
        const action = msg.text.split('uses ')[1].replace('!', '');
        setEffects((prev) => [...prev, action]);
      }
    });
  }, [messages]);

  // Placeholder for dynamic background images based on environment
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
      {/* Monster 1 */}
      <img src={monster1Img} alt="Monster 1" className="monster monster1" />
      
      {/* Monster 2 */}
      <img src={monster2Img} alt="Monster 2" className="monster monster2" />

      {/* Attack Effects */}
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
