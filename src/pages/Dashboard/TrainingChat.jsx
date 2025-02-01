import React, { useState, useEffect } from "react";
import "./TrainingChat.css";

const TrainingChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialMessage = async () => {
      try {
        const token = localStorage.getItem("aibeasts_token");

        if (!token) {
          setMessages([{ sender: "system", text: "🔒 Please log in to train your beast." }]);
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
          setMessages([{ sender: "beast", text: data.response }]);
        } else {
          setMessages([{ sender: "system", text: data.error || "Something went wrong." }]);
        }
      } catch (err) {
        console.error("Error fetching initial message:", err);
        setMessages([{ sender: "system", text: "⚠️ Error loading chat." }]);
      }
    };

    fetchInitialMessage();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    setMessages((prev) => [...prev, { sender: "player", text: input }]);
    setLoading(true);

    try {
      const token = localStorage.getItem("aibeasts_token");
      if (!token) {
        setMessages((prev) => [...prev, { sender: "system", text: "🔒 Please log in to continue training." }]);
        setLoading(false);
        return;
      }

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
        setMessages((prev) => [...prev, { sender: "system", text: `⚠️ ${data.error}` }]);
      } else {
        setMessages((prev) => [...prev, { sender: "beast", text: data.response }]);
      }
    } catch (err) {
      console.error("Error calling training API:", err);
      setMessages((prev) => [...prev, { sender: "system", text: "⚠️ Something went wrong." }]);
    }

    setInput("");
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="training-chat">
      <div className="training-chat-header">
        ⚔️ <span>Beast Training</span>
      </div>
      <div className="training-chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`training-chat-message ${m.sender}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="training-chat-input-container">
        <input
          className="training-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Command your beast..."
        />
        <button className="training-chat-send-button" onClick={handleSend} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default TrainingChat;
