// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './pages/Hero';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Matchmaking from './pages/Matchmaking';
import AIBattle from './pages/AIBattle';
import Visuals from './pages/Visuals';
import OnlineMatch from './pages/OnlineMatch';
import CryptoMatch from './pages/CryptoMatch';
import Train from './pages/Train';
import Dashboard from './pages/Dashboard/Dashboard'; 
import Connect from './components/ConnectWallet';
import BattleArena from './pages/BattleArena/BattleArena';
import FluxPage from './components/FluxPage'; 
import { VortexConnectProvider } from "./VortexConnectContext";
import BattleArenaOnline from './pages/BattleArena/BattleArenaOnline';
import LobbyBattle from './pages/BattleArena/LobbyBattle';
import MyLobbies from './pages/MyLobbies';
import ThreeDScene from './pages/3D';
import ThreeScene from './pages/3d/ThreeScene';

function App() {
  return (
    <VortexConnectProvider>
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/3dscene" element={<ThreeScene/>}/>
        <Route path="/arena" element={<BattleArena />} />
        <Route path="/crypto-match" element={<CryptoMatch />} />
        <Route path="/style" element={<Visuals />} />
        <Route path="/3d" element={<ThreeDScene/>} />
        <Route path="/matchmaking" element={<Matchmaking />} />
        <Route path="/online-match" element={<OnlineMatch />} />
        <Route path="/aibattle" element={<AIBattle />} />
        <Route path="/battle-arena-online" element={<BattleArenaOnline />} />
        <Route path="/train" element={<Train />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/flux" element={<FluxPage />} />
        <Route path="/mylobbies" element={<MyLobbies />} />
        <Route path="/lobby-battle" element={<LobbyBattle />} />
      </Routes>
      <Footer />
    </Router>
    </VortexConnectProvider>
  );
}

export default App;
