import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY, // Use process.env for backend environment variables
});

export default openai;
