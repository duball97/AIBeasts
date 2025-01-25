// src/components/Homepage.jsx

import React from "react";
import { Link } from "react-router-dom";

const Homepage = () => {
  return (
    <div className="homepage">
      <h1>Welcome to AI Meme Generator</h1>
      <p>Create and share hilarious memes powered by AI.</p>
      <Link to="/memes">
        <button className="start-button">Go to Meme Generator</button>
      </Link>
    </div>
  );
};

export default Homepage;