import React, { useEffect, useRef, useState } from "react";
import "./TerminalChat.css"; // Ensure you have this file for styling

const TerminalChat = ({ userBeast, aiBeast }) => {
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Scroll to the bottom when new messages are added
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Start battle only if both beasts are loaded
    if (userBeast && aiBeast) {
      setMessages([
        { sender: "system", text: "⚔️ Battle Start! ⚔️" },
        { sender: "system", text: `${userBeast.name} vs ${aiBeast.name}` },
      ]);
      startBattle(userBeast, aiBeast);
    }
  }, [userBeast, aiBeast]);

  const startBattle = (userBeast, aiBeast) => {
    let userHP = 100;
    let aiHP = 100;
    let turn = 0;

    const battleInterval = setInterval(() => {
      if (userHP <= 0 || aiHP <= 0) {
        clearInterval(battleInterval);
        setMessages((prev) => [
          ...prev,
          { sender: "system", text: userHP > 0 ? `${userBeast.name} wins! 🎉` : `${aiBeast.name} wins! 🏆` },
        ]);
        return;
      }

      const attacker = turn % 2 === 0 ? userBeast : aiBeast;
      const defender = turn % 2 === 0 ? aiBeast : userBeast;
      const attackMove = attacker.abilities?.attack || "Basic Attack";
      const damage = Math.floor(Math.random() * 15) + 5; // Random damage 5-15

      if (turn % 2 === 0) {
        aiHP -= damage;
      } else {
        userHP -= damage;
      }

      setMessages((prev) => [
        ...prev,
        { sender: attacker.name, text: `${attacker.name} uses ${attackMove}! 🌀` },
        { sender: "system", text: `${defender.name} takes ${damage} damage. HP: ${Math.max(0, turn % 2 === 0 ? aiHP : userHP)}` },
      ]);

      turn++;
    }, 2000);
  };

  // Placeholder message when data is loading
  if (!userBeast || !aiBeast) {
    return (
      <div className="terminal-chat">
        <h2>Battle Log</h2>
        <div className="chat-window">
          <div className="chat-message system">
            <p>Loading beasts... 🕒</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-chat">
      <h2>Battle Log</h2>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default TerminalChat;
