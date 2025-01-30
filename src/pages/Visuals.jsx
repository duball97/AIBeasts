import React, { useState } from "react";
import axios from "axios";
import "./Visuals.css";

const Visuals = () => {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("1:1"); // Default aspect ratio

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt!");
      return;
    }

    setLoading(true);
    setImageUrl(""); // Clear previous image

    try {
      const requestData = { prompt, aspectRatio };

      if (image) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          requestData.imageUrl = event.target.result;
          const response = await axios.post("/api/flux-generate", requestData);
          handleResponse(response);
        };
        reader.readAsDataURL(image);
      } else {
        const response = await axios.post("/api/flux-generate", requestData);
        handleResponse(response);
      }
    } catch (error) {
      console.error("Error generating image:", error.message);
      alert("Failed to generate the image. Please try again.");
      setLoading(false);
    }
  };

  const handleResponse = (response) => {
    setLoading(false);
    const { imageUrl: returnedValue } = response.data;

    if (!returnedValue) {
      alert("Error: No valid image URL received.");
      return;
    }

    if (typeof returnedValue === "string") {
      setImageUrl(returnedValue);
    } else if (
      typeof returnedValue === "object" &&
      returnedValue.output &&
      Array.isArray(returnedValue.output) &&
      returnedValue.output.length > 0
    ) {
      setImageUrl(returnedValue.output[0]);
    } else {
      alert("Error: No valid image URL received.");
    }
  };

  return (
    <div className="flux-container">
      <div className="flux-wrapper">
        {imageUrl && (
          <div>
            <img src={imageUrl} alt="Generated" className="flux-image" />
          </div>
        )}

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt"
          className="flux-input"
        />

        <label className="flux-label">
          Upload Image (Optional):
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="flux-file-input"
          />
        </label>

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

        <button onClick={handleGenerate} className="flux-button" disabled={loading}>
          {loading ? "Generating..." : "Generate Image"}
        </button>
      </div>
    </div>
  );
};

export default Visuals;
