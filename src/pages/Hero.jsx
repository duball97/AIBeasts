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
        <h1 className="hero-title">There are no limits to what you can imagine</h1>
       
        <p className="hero-description">
          Create unique monsters, engage in dynamic battles, and watch your beasts evolve through thrilling encounters.
        </p>
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
