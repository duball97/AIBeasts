import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import Replicate from "replicate";

dotenv.config();

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post("/api/flux-generate", async (req, res) => {
  try {
    const { prompt, imageUrl } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const input = {
      prompt,
      disable_safety_checker: true,
    };
    if (imageUrl) {
      input.image = imageUrl;
    }

    const output = await replicate.run("black-forest-labs/flux-schnell", { input });
    res.status(200).json({ imageUrl: output[0] });
  } catch (err) {
    console.error("[ERROR] flux-generate:", err);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

app.listen(3003, () => {
  console.log("Server is running on port 3003");
});
