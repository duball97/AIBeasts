import React, { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../supabaseClient"; // Adjust path if needed
import "./Visuals.css";

const Visuals = () => {
  const [monster, setMonster] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonster = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("aibeasts_token");
        if (!token) throw new Error("Please log in to view your monster.");

        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const { id: userId } = decodedToken;

        const { data, error } = await supabase
          .from("aibeasts_characters")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error) throw new Error(error.message);
        if (!data) throw new Error("No monster found for this user.");

        setMonster(data);
        generatePrompt(data.physic);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMonster();
  }, []);

  const generatePrompt = (physic) => {
    if (!Array.isArray(physic) || physic.length === 0) {
      setPrompt("No physic data available.");
      return;
    }

    const description = physic.join(", ");
    setPrompt(
      `Create a 2D cartoon-style monster illustration. It has ${description}. Style: Studio Ghibli, Dragon Ball, Family Guy.`
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Prompt is not available!");
      return;
    }

    setLoading(true);
    setImageUrl("");

    try {
      const requestData = { aspectRatio, prompt };
      const response = await axios.post("/api/visuals-generate", requestData);
      handleResponse(response);
    } catch (error) {
      setError("Failed to generate image.");
      setLoading(false);
    }
  };

  const handleResponse = async (response) => {
    setLoading(false);
    const { imageUrl: returnedValue } = response.data;

    let finalImageUrl = typeof returnedValue === "string" ? returnedValue : returnedValue?.output?.[0];

    if (!finalImageUrl) {
      setError("No valid image URL received.");
      return;
    }

    setImageUrl(finalImageUrl);

    if (monster?.user_id) {
      try {
        await supabase
          .from("aibeasts_characters")
          .update({ image_url: finalImageUrl })
          .eq("user_id", monster.user_id);
      } catch (error) {
        console.error("Failed to save image to Supabase:", error.message);
      }
    }
  };

  return (
    <div className="visuals-page">
      <h2>Monster Visuals</h2>
      <p>Generate a new visual for your AI Beast!</p>

      {loading && !monster ? <p>Loading your monster data...</p> : error ? <p className="error">{error}</p> : null}

      {monster && (
        <div className="monster-details">
          <h3>{monster.name}</h3>
          <p>{monster.description}</p>
          {monster.image_url && <img src={monster.image_url} alt={monster.name} className="monster-image" />}
        </div>
      )}

      {imageUrl && <img src={imageUrl} alt="Generated" className="generated-image" />}

      <button onClick={handleGenerate} className="custom-button" disabled={loading}>
        {loading ? "Generating..." : "Generate New Style"}
      </button>

      {monster && monster.physic && (
  <div className="generated-prompt">
    <h3>Description:</h3>
    <p>{monster.physic.join(", ")}</p>
  </div>
)}


      <label className="custom-label">
        Aspect Ratio:
        <select className="custom-select" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
          <option value="1:1">1:1 (Square)</option>
          <option value="16:9">16:9 (Landscape)</option>
          <option value="9:16">9:16 (Portrait)</option>
        </select>
      </label>

      
    </div>
  );
};

export default Visuals;
