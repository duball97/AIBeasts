// src/components/BattleArena.jsx
import React, { useState, useEffect } from 'react';
import './BattleArena.css';
import TerminalChat from './TerminalChat';
import VisualArena from './VisualArena';

const BattleArena = () => {
  const [messages, setMessages] = useState([
    { sender: 'system', text: 'Battle Start!' },
    { sender: 'ai', text: 'Shadowfang is preparing to attack.' },
    { sender: 'ai', text: 'Shadowfang uses FireBreath!' },
    { sender: 'ai', text: 'FireBreath activated!' },
  ]);

  // Simulate message updates (replace with real battle logic)
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'FireBreath hits the opponent!' },
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="battle-arena-container">
      <div className="terminal-column">
        <TerminalChat messages={messages} />
      </div>
      <div className="visual-column">
        <VisualArena messages={messages} />
      </div>
    </div>
  );
};

export default BattleArena;
