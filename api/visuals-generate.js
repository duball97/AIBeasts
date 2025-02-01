// pages/api/flux-generate.js
import dotenv from "dotenv";
dotenv.config();
import Replicate from "replicate";

// 1) Initialize Replicate with your token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 2) Define the base prompt for consistent style
const BASE_PROMPT = "Create a vibrant and detailed 2D cartoon illustration in the style of Studio Ghibli, epic 2d game background"; // Customize as needed

// 3) Serverless route handler
export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, aspectRatio = "1:1", imageUrl } = req.body; // Accept imageUrl for variations

    // Validate input: Either prompt or imageUrl must be present
    if (!prompt && !imageUrl) {
      return res.status(400).json({ error: "Prompt or imageUrl is required" });
    }

    console.log("[INFO] Received prompt:", prompt || "Using previous image for variation");
    console.log("[INFO] Aspect Ratio:", aspectRatio);

    // 4) Prepare input for Flux Schnell
    const input = {
      aspect_ratio: aspectRatio,          // Pass aspect ratio
      disable_safety_checker: true,       // Disable safety checker if supported
      go_fast: true,                      // Optional: Faster inference
      megapixels: "1",                    // Optional: Image size
      num_outputs: 1,                     // Number of images to generate
      output_format: "webp",              // Image format
      output_quality: 80,                 // Image quality
      num_inference_steps: 4,             // Number of inference steps
    };

    if (imageUrl) {
      input.image = imageUrl;
      input.prompt = `${BASE_PROMPT} Generate a variation of this image.`; // Enhanced variation prompt
    } else {
      input.prompt = `${BASE_PROMPT} ${prompt}`; // Combine base prompt with user prompt
    }

    // 5) Call Flux Schnell with aspect ratio and variations
    console.log("[INFO] Generating image using flux-schnell...");
    const output = await replicate.run("black-forest-labs/flux-schnell", { input });

    // 6) Validate that we got a ReadableStream or a direct URL
    if (!output || !Array.isArray(output) || output.length === 0) {
      console.error("[ERROR] Invalid output from flux-schnell");
      return res.status(500).json({ error: "Invalid output from flux-schnell" });
    }

    // 7) Check if output[0] is a ReadableStream or a URL
    let imageUrlResponse = "";
    if (output[0] instanceof ReadableStream) {
      // 7a) Read the ReadableStream and convert to base64
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

      // 8a) Convert chunks to a base64 image
      console.log("[INFO] Combining chunks...");
      const imageBuffer = Buffer.concat(chunks);
      imageUrlResponse = `data:image/png;base64,${imageBuffer.toString("base64")}`;
    } else if (typeof output[0] === "string") {
      // 7b) If output[0] is a URL string
      imageUrlResponse = output[0];
    } else {
      console.error("[ERROR] Unexpected output format from flux-schnell");
      return res.status(500).json({ error: "Unexpected output format from flux-schnell" });
    }

    // 9) Return the image URL (base64 or direct URL)
    console.log("[INFO] Flux image generation successful.");
    return res.status(200).json({
      imageUrl: imageUrlResponse, // Use data URL or direct URL
    });
  } catch (error) {
    console.error("[ERROR] flux-generate:", error.message);
    return res.status(500).json({ error: "Failed to generate flux image" });
  }
}
