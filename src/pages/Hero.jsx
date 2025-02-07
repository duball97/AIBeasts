import React from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css"; // Ensure this CSS file contains styles for the hero section

const Hero = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const token = localStorage.getItem("aibeasts_token");
    if (token) {
      navigate("/dashboard"); // Redirect to dashboard if token exists
    } else {
      navigate("/signin"); // Otherwise, redirect to sign-in page
    }
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">Shape your beast, train it, fight wars, win rewards.</h1>
       
        <p className="hero-description">
          AIBeasts, a strategy online game.        </p>
        <button
          className="btn"
          onClick={handleGetStarted} // Call the logic to handle navigation
        >
          Get Started
        </button>
      </div>
    </section>
  );
};

export default Hero;
