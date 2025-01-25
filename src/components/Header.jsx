// src/components/Header.jsx
import React, { useState } from 'react';
import './Header.css'; // Create this CSS file for styling
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="logo">
        <img src="/logo.png" alt="AI Beasts Logo" />
      </div>
      <nav className={`nav ${isMobileMenuOpen ? 'active' : ''}`}>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          {/* Add more navigation links as needed */}
        </ul>
      </nav>
      <div className="start-button">
        <Link to="/dashboard">
          <button className="btn">Start</button>
        </Link>
      </div>
      <div className="hamburger" onClick={toggleMobileMenu}>
        <div className={`bar ${isMobileMenuOpen ? 'change' : ''}`}></div>
        <div className={`bar ${isMobileMenuOpen ? 'change' : ''}`}></div>
        <div className={`bar ${isMobileMenuOpen ? 'change' : ''}`}></div>
      </div>
    </header>
  );
};

export default Header;
