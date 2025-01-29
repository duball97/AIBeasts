import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";
import openai from "../openaiClient.js";

// Hardcoded Supabase keys
const supabaseUrl = "https://mivxbkbqlpwfkrlgcvqt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pdnhia2JxbHB3ZmtybGdjdnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNzkxMjMsImV4cCI6MjA0NDc1NTEyM30.LuOK6Z0p4I3RAS-_HprsoHcsRZaXc-sW2Em9A_Mxg5I";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper Function: Generate AI Beast (Character) using OpenAI
const generateMonster = async () => {
  try {
    const prompt = "Generate a unique AI beast with a name, image description, abilities (attack, defense, special), personality traits (aggression, intelligence), and physical stats (strength, speed, endurance). Provide a structured JSON output.";
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });
    
    const response = JSON.parse(completion.choices[0].message.content.trim());

    const aiMonster = {
      id: uuidv4(),
      name: response.name,
      image_url: response.image_url || "https://robohash.org/default.png", // Default placeholder image
      abilities: response.abilities,
      personality: response.personality,
      wins: 0,
      games_played: 0,
      experience: 0,
      physic: response.physic,
      user_id: "AI_GENERATED", // Placeholder user ID
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("aibeasts_characters").insert([aiMonster]).select().single();
    if (error) {
      throw new Error(`Error inserting AI monster: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error generating AI monster:", error);
    throw new Error("Failed to generate AI monster");
  }
};

// API Handler for Generating AI Monster
const generateAIHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const aiMonster = await generateMonster();
    res.status(200).json({ success: true, monster: aiMonster });
  } catch (error) {
    console.error("Error generating AI monster:", error);
    res.status(500).json({ success: false, message: "Error creating AI monster", error: error.message });
  }
};

export default generateAIHandler;