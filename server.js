import express from "express";
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();

import trainingRouter from "./api/training.js"; // Training API route
import authRouter from "./api/auth.js"; // Authentication API route
import battleRouter from "./api/battle.js"; // Authentication API route
import extractTraitOrAbilityRouter from "./api/extractTraitOrAbility.js"; // Authentication API route
import fluxGenerateRouter from "./api/flux-generate.js";


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow requests from any origin
app.use(express.json()); // Parse incoming JSON request bodies

// Routes
app.use("/api/training", trainingRouter); // Mount the training API
app.use("/api/auth", authRouter); // Mount the auth API
app.use("/api/battle", battleRouter); // Mount the auth API
app.use("/api/extractTraitOrAbility", extractTraitOrAbilityRouter); // Mount the auth API
app.use("/api/flux-generate", fluxGenerateRouter); // Mount the auth API


// Root Route for Testing
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
