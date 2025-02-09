import React, { useState, useEffect, useRef } from "react";
import "./TrainingChat.css";
import MonsterInfo from "./MonsterInfo"; // Import MonsterInfo

const TrainingChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatWindowRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false); // Track manual scrolling

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

        console.error("Error fetching initial message:", err.message, err.stack);
        +        setMessages([{ sender: "system", text: "⚠️ Error loading chat. Check console for details." }]);
     
        
      }
    };

    fetchInitialMessage();
  }, []);

  const handleSend = async () => {
    // Check if input has non-whitespace characters and if not loading
    if (!input.trim() || loading) return;
    
    // Store the original input (with its formatting) before clearing it
    const messageToSend = input;
    
    // Immediately clear the input field
    setInput("");
    
    // Add the player's message to the chat
    setMessages((prev) => [...prev, { sender: "player", text: messageToSend }]);
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
        body: JSON.stringify({ message: messageToSend }),
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

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Auto-scroll to the bottom when new messages arrive (unless user manually scrolled up)
  useEffect(() => {
    if (chatWindowRef.current && !isUserScrolling) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  // Detect user scrolling to prevent auto-scroll when they are manually scrolling
  const handleScroll = () => {
    if (chatWindowRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatWindowRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 10; // Small tolerance
      setIsUserScrolling(!isAtBottom);
    }
  };

  return (
    <div className="training-chat">
      {/* Flex container to align MonsterInfo on left and chat on right */}
      <div className="monster-content">
        {/* MonsterInfo on the left */}
        <div className="monster-monster">
          <MonsterInfo />
        </div>

        {/* Chat on the right */}
        <div className="training-chat-box">
          <div className="training-chat-header">
            ⚔️ <span>BEAST TRAINING</span>
          </div>

          <div className="training-chat-window" ref={chatWindowRef} onScroll={handleScroll}>
            {messages.map((m, i) => (
              <div key={i} className={`training-chat-message ${m.sender}`}>
                {m.text}
              </div>
            ))}
          </div>

          {/* Input Field */}
          <div className="training-chat-input-container">
            <input
              className="training-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Start training your beast"
            />
            <button className="training-chat-send-button" onClick={handleSend} disabled={loading}>
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingChat;
