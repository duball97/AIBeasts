// src/components/TerminalChat.jsx
import React, { useEffect, useRef } from 'react';
import './TerminalChat.css'; // Create this CSS file for styling

const TerminalChat = ({ messages }) => {
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom when new messages are added
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
