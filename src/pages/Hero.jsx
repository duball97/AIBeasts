// src/components/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css'; // Create this CSS file for styling

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">Welcome to AI Beasts</h1>
        <h2 className="hero-subtitle">Unleash Your Imagination in Chaotic Monster Battles</h2>
        <p className="hero-description">
          Create unique monsters, engage in dynamic battles, and watch your beasts evolve through thrilling encounters. Join the revolution of AI-driven gameplay where creativity meets strategy.
        </p>
        <Link to="/dashboard">
          <button className="btn">Get Started</button>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
