// src/App.jsx

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Memes from "./components/Memes";
import WalletConnection from "./components/WalletProvider";
import FluxPage from "./components/FluxPage";
import Midjourney from "./components/Midjourney";
import FineTune from "./components/FineTune";
import Homepage from "./pages/Homepage"; // Import Homepage component

function App() {
  const [agentDetails, setAgentDetails] = useState(null);

  const handleAgentCreated = (details) => {
    setAgentDetails(details);
  };

  return (
    <Router>
      <WalletConnection>
        <Routes>
          <Route path="/" element={<Homepage />} /> {/* Add Homepage */}
          <Route path="/memes" element={<Memes />} />
          <Route path="/finetune" element={<FineTune />} />
          <Route path="/flux" element={<FluxPage />} />
          <Route path="/midjourney" element={<Midjourney />} />
        </Routes>
      </WalletConnection>
    </Router>
  );
}

export default App;
