// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './pages/Hero';
import Dashboard from './pages/Dashboard'; // Create this component next
import FluxPage from './components/FluxPage'; // Create this component next


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/flux" element={<FluxPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
