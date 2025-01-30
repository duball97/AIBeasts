// pages/api/flux-generate.js
import dotenv from "dotenv";
dotenv.config();
import Replicate from "replicate";

// 1) Initialize Replicate with your token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 2) Serverless route handler
export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, aspectRatio = "1:1" } = req.body; // Default aspect ratio is 1:1
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log("[INFO] Received prompt:", prompt);
    console.log("[INFO] Aspect Ratio:", aspectRatio);

    // 3) Call Flux Schnell with aspect ratio
    console.log("[INFO] Generating image using flux-schnell...");
    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: {
        prompt,
        aspect_ratio: aspectRatio, // Pass the aspect ratio
        disable_safety_checker: true, // if your model supports it
      },
    });

    // 4) Validate that we got a ReadableStream
    if (!output || !(output[0] instanceof ReadableStream)) {
      console.error("[ERROR] Invalid output from flux-schnell");
      return res.status(500).json({ error: "Invalid output from flux-schnell" });
    }

    // 5) Read the stream
    console.log("[INFO] Processing ReadableStream...");
    const readableStream = output[0];
    const reader = readableStream.getReader();
    const chunks = [];
    let done = false;

    while (!done) {
      const { value, done: isDone } = await reader.read();
      if (value) {
        chunks.push(value);
      }
      done = isDone;
    }

    // 6) Convert chunks to a base64 image
    console.log("[INFO] Combining chunks...");
    const imageBuffer = Buffer.concat(chunks);
    const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;

    // 7) Return the base64 image
    console.log("[INFO] Flux image generation successful.");
    return res.status(200).json({
      imageUrl: base64Image, // Use data URL
    });
  } catch (error) {
    console.error("[ERROR] flux-generate:", error.message);
    return res.status(500).json({ error: "Failed to generate flux image" });
  }
}
