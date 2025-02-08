// src/components/TerminalChatReplay.jsx
import React, { useEffect, useRef, useState } from "react";
import "./TerminalChat.css";

const TerminalChatReplay = ({ savedBattleLog, winnerExplanation }) => {
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [replayLoading, setReplayLoading] = useState(true);

  // Scroll to the bottom whenever messages update.
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (savedBattleLog && Array.isArray(savedBattleLog)) {
      replayBattle(savedBattleLog);
    }
  }, [savedBattleLog]);

  const replayBattle = (log) => {
    let turn = 0;
    const revealNext = () => {
      if (turn >= log.length) {
        setReplayLoading(false);
        return;
      }
      setMessages((prev) => [...prev, log[turn]]);
      turn++;
      setTimeout(revealNext, 3000);
    };
    revealNext();
  };

  return (
    <div className="terminal-chat">
      <h2>Battle Log Replay</h2>
      <div className="chat-window">
        {messages.map((line, idx) => (
          <div key={idx} className="chat-message">
            <p>{line}</p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      {!replayLoading && winnerExplanation && (
        <div className="winner">
          🏆 <strong>Battle Result:</strong> {winnerExplanation}
        </div>
      )}
    </div>
  );
};

export default TerminalChatReplay;
