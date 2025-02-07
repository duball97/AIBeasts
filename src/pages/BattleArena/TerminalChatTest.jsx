// src/components/TerminalChatTest.jsx
import React, { useEffect, useRef, useState } from "react";
import "./TerminalChat.css";

const TerminalChatTest = ({ userBeast, aiBeast }) => {
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [winnerExplanation, setWinnerExplanation] = useState(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When both beasts are loaded, start the dummy battle
  useEffect(() => {
    if (userBeast && aiBeast) {
      startBattleTest(userBeast, aiBeast);
    }
  }, [userBeast, aiBeast]);

  const startBattleTest = (userBeast, aiBeast) => {
    // Dummy battle transcript – replace these lines with whatever dialogue you want for testing
    const dummyTranscript = [
      "You lunge forward with a mighty roar!",
      "Opponent counters with a swift strike!",
      "You dodge the attack and unleash a powerful blow!",
      "Opponent stumbles, barely holding on!",
      "Final blow! Your beast emerges victorious!"
    ];
  
    // Set initial system messages
    setMessages([
      { sender: "system", text: "⚔️ Battle Start! ⚔️" },
      { sender: "system", text: `${userBeast.name} vs ${aiBeast.name}` },
      { sender: "system", text: "Generating battle dialogue... 🤖" },
    ]);
  
    let turn = 0;
  
    const sendNextMessage = () => {
      if (turn >= dummyTranscript.length) {
        setWinnerExplanation("Your beast's strategy was unmatched!"); // Dummy explanation
        setLoading(false);
        return;
      }
      // Alternate turns between user and opponent
      setMessages(prev => [
        ...prev,
        { sender: turn % 2 === 0 ? userBeast.name : aiBeast.name, text: dummyTranscript[turn] }
      ]);
      turn++;
      // Schedule next message after 3 seconds
      setTimeout(sendNextMessage, 3000);
    };
  
    // Start the recursive timeout
    sendNextMessage();
  };
  

  if (loading) return <div className="terminal-chat">Loading battle... 🕒</div>;
  if (error) return <div className="terminal-chat error">{error}</div>;

  return (
    <div className="terminal-chat">
      <h2>Battle Log (Test Mode)</h2>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      {winnerExplanation && (
        <div className="winner">
          🏆 <strong>Battle Result:</strong> {winnerExplanation}
        </div>
      )}
    </div>
  );
};

export default TerminalChatTest;
