import React, { useState } from "react";
import "./TrainingChat.css"; // Import the CSS file for styles

const TrainingChat = () => {
  const [messages, setMessages] = useState([
    { sender: "system", text: "Start training your monster! Type a command or question below." },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    try {
      // Make POST request to the API
      const response = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "123", character_name: "MonsterX", message: input }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => [...prev, { sender: "system", text: `Error: ${data.error}` }]);
      } else {
        setMessages((prev) => [...prev, { sender: "ai", text: data.response }]);
      }
    } catch (err) {
      console.error("Error calling training API:", err);
      setMessages((prev) => [...prev, { sender: "system", text: "Something went wrong :(" }]);
    }

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="training-chat">
      <h2 className="training-chat-title">Training Chat</h2>
      <div className="training-chat-window">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`training-chat-message ${
              m.sender === "user" ? "training-chat-message-user" : "training-chat-message-ai"
            }`}
          >
            <strong>{m.sender}:</strong> {m.text}
          </div>
        ))}
      </div>
      <input
        className="training-chat-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your prompt..."
      />
      <button className="training-chat-send-button" onClick={handleSend}>
        Send
      </button>
    </div>
  );
};

export default TrainingChat;
