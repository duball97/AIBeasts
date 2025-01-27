// src/pages/Train.jsx
import React from "react";
import TrainingChat from "./Dashboard/TrainingChat"; // Adjust path if necessary
import "./Train.css"; // Optional CSS for the Train page

const Train = () => {
  return (
    <div className="train-page">
      <h2>Train Your Monster</h2>
      <TrainingChat />
    </div>
  );
};

export default Train;
