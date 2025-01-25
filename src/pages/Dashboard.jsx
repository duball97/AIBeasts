// src/components/Dashboard.jsx
import React from 'react';
import './Dashboard.css'; // Create this CSS file for styling

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="monster-info">
        <img src="/monster-placeholder.png" alt="Your AI Beast" className="monster-image" />
        <div className="info">
          <h2>Monster Name</h2>
          <p><strong>Personality:</strong> Fearless and cunning.</p>
          <p><strong>Abilities:</strong> Fire Breath, Invisibility.</p>
          <p><strong>Strengths:</strong> High attack power.</p>
          <p><strong>Weaknesses:</strong> Vulnerable to ice attacks.</p>
          {/* Add more dynamic info as needed */}
        </div>
      </div>
      <div className="training-chat">
        <h2>Train Your AI Beast</h2>
        <div className="chat-window">
          {/* Implement chat interface here */}
          <p>Chat with your AI Beast to train and evolve it!</p>
        </div>
        <input type="text" placeholder="Enter your command..." className="chat-input" />
        <button className="send-button">Send</button>
      </div>
    </div>
  );
};

export default Dashboard;
