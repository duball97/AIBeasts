import React, { useState, useEffect } from "react";
import "./TrainingChat.css";

const TrainingChat = () => {
  const [messages, setMessages] = useState([]); // Start empty
  const [input, setInput] = useState("");

  // Fetch the initial message when the component mounts
  useEffect(() => {
    const fetchInitialMessage = async () => {
      try {
        const token = localStorage.getItem("aibeasts_token");
    
        if (!token) {
          setMessages([
            { sender: "system", text: "You are not logged in. Please log in to continue." },
          ]);
          return;
        }
    
        const response = await fetch("/api/training", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: "" }),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          setMessages([
            { sender: "ai", text: data.response },
            { sender: "ai", text: "For example, you can say: 'Make my beast courageous' or 'Teach it FireBreath!'" },
          ]);
        } else {
          setMessages([{ sender: "system", text: data.error || "Something went wrong." }]);
        }
      } catch (err) {
        console.error("Error fetching initial message:", err);
        setMessages([{ sender: "system", text: "Something went wrong :(" }]);
      }
    };
    

    fetchInitialMessage();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    try {
      const token = localStorage.getItem("aibeasts_token");

      if (!token) {
        setMessages((prev) => [
          ...prev,
          { sender: "system", text: "You are not logged in. Please log in to continue." },
        ]);
        return;
      }

      // Send the user message to the API
      const response = await fetch("/api/training", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input }),
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
