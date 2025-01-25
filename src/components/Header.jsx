// src/components/Header.jsx

import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import logo from "../assets/logo.png"; // Ensure you have a logo image in this path

function Header() {
  return (
    <header className="header">
      <nav className="nav-menu">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/chat">Create</Link>
          </li>
          <li>
            <Link to="/agents">Agents</Link>
          </li>
          <li>
            <Link to="/leaderboard">Generate Tweets</Link>
          </li>

        </ul>
      </nav>
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
    </header>
  );
}

export default Header;
 