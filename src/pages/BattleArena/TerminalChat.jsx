// src/components/TerminalChat.jsx
import React, { useEffect, useRef, useState } from "react";
import "./TerminalChat.css";

const TerminalChat = ({ userBeast, aiBeast, lobbyDetails }) => {
  const chatWindowRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [winnerExplanation, setWinnerExplanation] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Monitor scroll position on the chat window.
  const handleScroll = () => {
    const chatWindow = chatWindowRef.current;
    if (!chatWindow) return;
    // Check if user is near the bottom (within 10px tolerance)
    const isAtBottom =
      chatWindow.scrollHeight - chatWindow.scrollTop <= chatWindow.clientHeight + 10;
    setAutoScroll(isAtBottom);
  };

  useEffect(() => {
    const chatWindow = chatWindowRef.current;
    if (chatWindow) {
      chatWindow.addEventListener("scroll", handleScroll);
      return () => chatWindow.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Only scroll to bottom automatically if the user is already near the bottom.
  useEffect(() => {
    if (autoScroll && chatWindowRef.current) {
      // Scroll so that the last message is fully visible.
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  useEffect(() => {
    if (userBeast && aiBeast) {
      startBattle(userBeast, aiBeast);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userBeast, aiBeast]);

  const startBattle = async (userBeast, aiBeast) => {
    try {
      setMessages([
        { role: "system", text: "⚔️ Battle Start! ⚔️" },
        { role: "system", text: `${userBeast.name} vs ${aiBeast.name}` },
       
      ]);

      // Get the token from localStorage
      const token = localStorage.getItem("aibeasts_token");

      const response = await fetch("/api/battle", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Ensure token is passed
        },
        // Pass lobbyDetails along with the beasts
        body: JSON.stringify({ userBeast, aiBeast, lobbyDetails }),
      });

      const data = await response.json();
      if (!data.transcript) throw new Error("No battle response received.");

      const battleLines = data.transcript.split("\n").filter(line => line.trim() !== "");

      let turn = 0;
      const sendNextLine = () => {
        if (turn >= battleLines.length) {
          // When all battle lines have been displayed, show the judge's feedback.
          setWinnerExplanation(data.judge_log);
          return;
        }
        setMessages(prev => [
          ...prev,
          { role: turn % 2 === 0 ? "user" : "ai", text: battleLines[turn] }
        ]);
        turn++;
        setTimeout(sendNextLine, 3000);
      };

      sendNextLine();
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
      <h2>Battle Terminal</h2>
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      {winnerExplanation && (
        <div className="winner">
          🏆 <strong>Battle Result:</strong> {winnerExplanation}
        </div>
      )}
    </div>
  );
};

export default TerminalChat;
