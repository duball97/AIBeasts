import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.VITE_OPENAI_API_KEY, // Add this key to your .env file
});

export default openai;
