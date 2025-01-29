import React, { useEffect, useRef, useState } from "react";
import "./TerminalChat.css"; // Ensure this file exists

const TerminalChat = ({ userBeast, aiBeast }) => {
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (userBeast && aiBeast) {
      startBattle(userBeast, aiBeast);
    }
  }, [userBeast, aiBeast]);

  const startBattle = async (userBeast, aiBeast) => {
    try {
      setMessages([
        { sender: "system", text: "⚔️ Battle Start! ⚔️" },
        { sender: "system", text: `${userBeast.name} vs ${aiBeast.name}` },
        { sender: "system", text: "Generating battle dialogue... 🤖" },
      ]);

      const response = await fetch("/api/battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userBeast, aiBeast }),
      });

      const data = await response.json();
      if (!data.transcript) throw new Error("No battle response received.");

      const battleLines = data.transcript.split("\n").filter(line => line.trim() !== "");

      // Simulate AI turns in chat (adds messages gradually)
      let turn = 0;
      const interval = setInterval(() => {
        if (turn >= battleLines.length) {
          clearInterval(interval);
          return;
        }

        setMessages(prev => [...prev, { sender: turn % 2 === 0 ? userBeast.name : aiBeast.name, text: battleLines[turn] }]);
        turn++;
      }, 3000); // Messages appear every 3 seconds
    } catch (err) {
      console.error("Error starting battle:", err.message);
      setError("Failed to generate battle.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="terminal-chat">Loading battle... 🕒</div>;
  if (error) return <div className="terminal-chat error">{error}</div>;

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
