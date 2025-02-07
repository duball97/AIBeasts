import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SignIn.css";

function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("aibeasts_token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }), // Removed email
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("aibeasts_token", data.token);
        navigate("/dashboard");
      } else {
        setError(data.error || "An unexpected error occurred.");
      }
    } catch (err) {
      console.error("Sign-in error:", err.message);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="sign-in-page">
      <div className="sign-in-box">
        <h1>Sign In / Sign Up</h1>
        <form onSubmit={handleSignIn}>
          <label>
            <span>Username:</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </label>

          <label>
            <span>Password:</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default SignIn;
