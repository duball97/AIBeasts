// components/Visuals.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../supabaseClient"; // Adjust the path as needed
import "./Visuals.css";

const Visuals = () => {
  const [monster, setMonster] = useState(null); // Store monster data
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("1:1"); // Default aspect ratio
  const [prompt, setPrompt] = useState(""); // Store the generated prompt
  const [error, setError] = useState(null); // Store any errors

  // Fetch monster data on component mount
  useEffect(() => {
    const fetchMonster = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem("aibeasts_token");
        
        if (!token) {
          throw new Error("No token found. Please log in to view your monster.");
        }
        
        const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT
        const { id: userId } = decodedToken;
        
        console.log("🔍 Fetching from Supabase with user ID:", userId);
        
        const { data, error } = await supabase
          .from("aibeasts_characters")
          .select("*")  // Fetch all columns to include 'physic'
          .eq("user_id", userId)
          .single();
        
        console.log("📊 Supabase Response:", { data, error });
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (!data) {
          throw new Error("No monster found for this user.");
        }
        
        setMonster(data);
        generatePrompt(data.physic); // Generate prompt after fetching data
      } catch (err) {
        console.error("❌ Error fetching monster:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMonster();
  }, []);

  // Function to generate prompt based on physic data
  const generatePrompt = (physic) => {
    if (!Array.isArray(physic) || physic.length === 0) {
      setPrompt("No physic data available to generate a prompt.");
      return;
    }
  
    // Join array elements into a description
    const description = physic.join(", ");
  
    // Generate a complete prompt with a fixed style
    const promptText = `Create a detailed 2D cartoon illustration of a monster. It has ${description}. Style: Studio Ghibli.`;
  
    setPrompt(promptText);
  };
  
  

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Prompt is not available!");
      return;
    }
  
    setLoading(true);
    setImageUrl(""); // Clear previous image
  
    try {
      const requestData = {
        aspectRatio,
        prompt, // Only using the prompt, ignoring images
      };
  
      console.log("🚀 Sending request to API:", requestData);
  
      // Send request to API
      const response = await axios.post("/api/visuals-generate", requestData);
      handleResponse(response);
    } catch (error) {
      console.error("❌ Error generating image:", error.message);
      alert("Failed to generate the image. Please try again.");
      setLoading(false);
    }
  };
  
  

  const handleResponse = async (response) => {
    setLoading(false);
    const { imageUrl: returnedValue } = response.data;
  
    if (!returnedValue) {
      alert("Error: No valid image URL received.");
      return;
    }
  
    let finalImageUrl = "";
  
    if (typeof returnedValue === "string") {
      finalImageUrl = returnedValue;
    } else if (
      typeof returnedValue === "object" &&
      returnedValue.output &&
      Array.isArray(returnedValue.output) &&
      returnedValue.output.length > 0
    ) {
      finalImageUrl = returnedValue.output[0];
    } else {
      alert("Error: No valid image URL received.");
      return;
    }
  
    setImageUrl(finalImageUrl);
  
    // Save to Supabase
    if (monster?.user_id) {
      try {
        const { error } = await supabase
          .from("aibeasts_characters")
          .update({ image_url: finalImageUrl }) // Update the image_url column
          .eq("user_id", monster.user_id);
  
        if (error) throw new Error(error.message);
        console.log("✅ Image URL saved to Supabase!");
      } catch (error) {
        console.error("❌ Failed to save image URL to Supabase:", error.message);
      }
    }   
  };
  

  if (loading && !monster) {
    return (
      <div className="flux-container">
        <div className="flux-wrapper">
          <p>Loading your monster data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flux-container">
        <div className="flux-wrapper">
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flux-container">
      <div className="flux-wrapper">
        {/* Display Monster Details */}
       
        {/* Display Generated Image */}
        {imageUrl && (
          <div>
            <img src={imageUrl} alt="Generated" className="flux-image" />
          </div>
        )}
        {monster && (
          <div className="monster-details">
            <h2>{monster.name}</h2>
            <p>{monster.description}</p>
            {monster.image_url && (
              <img
                src={monster.image_url}
                alt={monster.name}
                className="monster-image"
              />
            )}
          </div>
        )}

        {/* Display Generated Prompt */}
        {prompt && (
          <div className="generated-prompt">
            <h3>Generated Prompt:</h3>
            <p>{prompt}</p>
          </div>
        )}

       

        {/* Aspect Ratio Selection */}
        <label className="flux-label">
          Aspect Ratio:
          <select
            className="flux-select"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
          >
            <option value="1:1">1:1 (Square)</option>
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Portrait)</option>
            <option value="4:5">4:5</option>
            <option value="3:2">3:2</option>
          </select>
        </label>

        {/* Generate Buttons */}
        <button
          onClick={() => handleGenerate(false)}
          className="flux-button"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>
      </div>
    </div>
  );
};

export default Visuals;
