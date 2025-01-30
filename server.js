import express from "express";
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();

import trainingRouter from "./api/training.js"; // Training API route
import authRouter from "./api/auth.js"; // Authentication API route
import battleRouter from "./api/battle.js"; // Authentication API route
import extractTraitOrAbilityRouter from "./api/extractTraitOrAbility.js"; // Authentication API route
import fluxGenerateRouter from "./api/flux-generate.js";
import visualGenerateRouter from "./api/visuals-generate.js";


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow requests from any origin
app.use(express.json()); // Parse incoming JSON request bodies

// Routes
app.use("/api/training", trainingRouter); 
app.use("/api/auth", authRouter); 
app.use("/api/battle", battleRouter); 
app.use("/api/extractTraitOrAbility", extractTraitOrAbilityRouter); 
app.use("/api/flux-generate", fluxGenerateRouter); 
app.use("/api/visuals-generate", visualGenerateRouter);


// Root Route for Testing
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
