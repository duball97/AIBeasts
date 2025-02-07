import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KE Y, // Use process.env for backend environment variables
});

export default openai;
