// src/components/Dashboard/TrainingChat.jsx
import React, { useState } from 'react';
import './TrainingChat.css'; // Ensure this CSS file exists

const TrainingChat = () => {
  const [messages, setMessages] = useState([
    { sender: 'system', text: 'Chat with your AI Beast to train and evolve it!' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;

    // Add user message
    setMessages([...messages, { sender: 'user', text: input }]);

    // Simulate AI response (replace with actual AI integration)
    const aiResponse = `AI Beast responds to "${input}"`;
    setTimeout(() => {
      setMessages(prevMessages => [...prevMessages, { sender: 'ai', text: aiResponse }]);
    }, 1000);

    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="training-chat">
      <h2>Train Your AI Beast</h2>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Enter your command..."
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="send-button" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default TrainingChat;
