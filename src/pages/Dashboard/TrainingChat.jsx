// src/components/TrainingChat.jsx
import React, { useState } from 'react';

const TrainingChat = () => {
  const [messages, setMessages] = useState([
    { sender: 'system', text: 'Start training your monster! Type a command or question below.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    setMessages(prev => [...prev, { sender: 'user', text: input }]);

    try {
      // Make POST request to our serverless function
      const response = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      });
      const data = await response.json();

      if (data.error) {
        // handle error
        setMessages(prev => [...prev, { sender: 'system', text: `Error: ${data.error}` }]);
      } else {
        // data.completion is the Llama 3 result
        setMessages(prev => [...prev, { sender: 'ai', text: data.completion }]);
      }
    } catch (err) {
      console.error('Error calling training API:', err);
      setMessages(prev => [...prev, { sender: 'system', text: 'Something went wrong :(' }]);
    }

    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div style={{ backgroundColor: '#333', padding: '10px', borderRadius: '8px' }}>
      <h2 style={{ color: '#fff' }}>Training Chat</h2>
      <div style={{ backgroundColor: '#222', minHeight: '150px', padding: '10px', borderRadius: '4px', marginBottom: '10px', overflowY: 'auto', maxHeight: '300px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: '5px 0', color: m.sender === 'user' ? '#FFD700' : '#fff' }}>
            <strong>{m.sender}:</strong> {m.text}
          </div>
        ))}
      </div>
      <input
        style={{ width: '80%', padding: '8px', marginRight: '5px' }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your prompt..."
      />
      <button onClick={handleSend} style={{ padding: '8px 15px' }}>Send</button>
    </div>
  );
};

export default TrainingChat;
