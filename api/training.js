// /api/training.js (Vercel or Next.js style serverless function)

// If using Next.js or Vercel serverless, we do something like:
import Replicate from "replicate";

// Using top-level await not always allowed, so we wrap in function
export default async function handler(req, res) {
  // Ensure only POST is used
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // You might parse the body differently if using raw Express
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  // Initialize Replicate
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
  });

  try {
    // Prepare input for meta/meta-llama-3-8b
    const input = {
      top_p: 0.9,
      prompt: prompt,          // user prompt
      min_tokens: 0,
      temperature: 0.6,
      presence_penalty: 1.15,
    };

    // Actually call the model
    // replicate.run or replicate.stream are available.
    // We'll use .run to get full text at once:
    const output = await replicate.run(
      "meta/meta-llama-3-8b", 
      { input }
    );

    // output will be the model's text completion.
    // Usually it's a string (the entire completion)
    return res.status(200).json({ completion: output });
  } catch (error) {
    console.error('Error calling Llama 3 API:', error);
    return res.status(500).json({ error: 'Something went wrong', details: String(error) });
  }
}
