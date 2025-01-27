import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken"; // For JWT validation
import openai from "../openaiClient.js"; // Import OpenAI client
import { supabase } from "../supabaseClient.js"; // Import Supabase client

// Helper Function: Retrieve or Create AI Beast (Character)
const getOrCreateCharacter = async (user_id, character_name = null) => {
  const { data, error } = await supabase
    .from("aibeasts_characters")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  if (data) {
    return data; // Return existing character
  } else if (character_name) {
    // Create a new character if a name is provided
    const { data: newCharacter, error: insertError } = await supabase
      .from("aibeasts_characters")
      .insert([
        {
          user_id,
          name: character_name,
          image_url: "", // Defaults can be adjusted
          abilities: [],
          conversation_log: [
            { sender: "system", text: `Your beast, ${character_name}, has been created!` },
          ],
          personality: [], // Initialize as an empty array
          wins: 0,
          games_played: 0,
          experience: 0,
        },
      ])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return newCharacter;
  }

  // If no character exists and no name is provided
  return null;
};

// Serverless Handler for /api/training
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { authorization } = req.headers;
  const { message } = req.body;

  if (!authorization) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.id;

    let character = await getOrCreateCharacter(user_id);

    if (!message) {
      return res.status(200).json({
        response: character
          ? `Welcome back! Your beast is ${character.name}. What are we going to train today?`
          : "Welcome to AIBeasts Game. I am your new beast. I can be whatever you want me to be. You will train me to win battles against other players around the world. The better you train me, the better I become. What do you want to call me?",
      });
    }

    const cleanedConversationLog = (character.conversation_log || [])
      .filter((msg) => msg && typeof msg.text === "string" && msg.text.trim())
      .map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text.trim(),
      }));

    const openaiMessages = [
      {
        role: "system",
        content: "You are an assistant that helps train monsters in a chaotic battle game.",
      },
      ...cleanedConversationLog,
      {
        role: "user",
        content: message.trim(),
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
    });

    const aiResponse = completion.choices[0].message.content.trim();

    const finalConversation = [
      ...(character.conversation_log || []),
      { sender: "user", text: message.trim() },
      { sender: "assistant", text: aiResponse },
    ];

    const { error: updateError } = await supabase
      .from("aibeasts_characters")
      .update({ conversation_log: finalConversation })
      .eq("id", character.id);

    if (updateError) {
      throw updateError;
    }

    res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error("Error in /api/training:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
