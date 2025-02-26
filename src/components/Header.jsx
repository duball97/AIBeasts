import React, { useState } from 'react';
import './Header.css'; // Use the updated CSS below
import { Link } from 'react-router-dom';
import logo from "../assets/logo.png";

const Header = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="AIBeasts Logo" />
      </div>
      <div className="hamburger" onClick={toggleMobileMenu}>
        <div className={`bar ${isMobileMenuOpen ? 'change' : ''}`}></div>
        <div className={`bar ${isMobileMenuOpen ? 'change' : ''}`}></div>
        <div className={`bar ${isMobileMenuOpen ? 'change' : ''}`}></div>
      </div>
      <nav className={`nav ${isMobileMenuOpen ? 'active' : ''}`}>
        <ul>
          <li><Link to="/" onClick={toggleMobileMenu}>Home</Link></li>
          <li><Link to="/dashboard" onClick={toggleMobileMenu}>Dashboard</Link></li>
          <li><Link to="/matchmaking" onClick={toggleMobileMenu}>Fight</Link></li>
          <li><Link to="/style" onClick={toggleMobileMenu}>Style</Link></li>
          <li><Link to="/connect" onClick={toggleMobileMenu}>Connect</Link></li>
          <li><Link to="/mylobbies" onClick={toggleMobileMenu}>MyLobbies</Link></li>
          <li><Link to="/3d" onClick={toggleMobileMenu}>3d</Link></li>

          <li><Link to="/3dscene" onClick={toggleMobileMenu}>3dbattle</Link></li>
          <li><Link to="/signin" onClick={toggleMobileMenu}>Sign In</Link></li>
        </ul>
      </nav>
      <div className="start-button">
        <Link to="/dashboard">
          <button className="btn">Start</button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
