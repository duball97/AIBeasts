// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './pages/Hero';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Matchmaking from './pages/Matchmaking';
import AIBattle from './pages/AIBattle';
import Visuals from './pages/Visuals';
import OnlineMatch from './pages/OnlineMatch';
import Train from './pages/Train';
import Dashboard from './pages/Dashboard/Dashboard'; // Create this component next
import BattleArena from './pages/BattleArena/BattleArena';
import FluxPage from './components/FluxPage'; // Create this component next
import { VortexConnectProvider } from "./VortexConnectContext";


function App() {
  return (
    <VortexConnectProvider>
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/arena" element={<BattleArena />} />
        <Route path="/style" element={<Visuals />} />
        <Route path="/matchmaking" element={<Matchmaking />} />
        <Route path="/online-match" element={<OnlineMatch />} />
        <Route path="/aibattle" element={<AIBattle />} />
        <Route path="/train" element={<Train />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/flux" element={<FluxPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
    </VortexConnectProvider>
  );
}

export default App;
