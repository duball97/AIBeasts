// src/components/Footer.jsx
import React from "react";
import "./Footer.css"; // Import the CSS for styling
import logo from "../assets/logo.png"; // Import the logo from the assets folder

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <img src={logo} alt="AIBeasts Logo" />
         
        </div>
        <p>&copy; {new Date().getFullYear()} AIBeasts. All rights reserved.</p>
        <div className="footer-links">
          <a href="/signin">Sign In</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
