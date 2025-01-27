import dotenv from "dotenv";
dotenv.config();

import openai from "../openaiClient.js"; // Import OpenAI client
import { supabase } from "../supabaseClient.js"; // Import Supabase client

// Helper Function: Retrieve or Create AI Beast (Character)
const getOrCreateCharacter = async (user_id, character_name) => {
  const { data, error } = await supabase
    .from("aibeasts_characters")
    .select("*")
    .eq("user_id", user_id)
    .eq("name", character_name)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  if (data) {
    return data;
  } else {
    const { data: newData, error: newError } = await supabase
      .from("aibeasts_characters")
      .insert([
        {
          user_id,
          name: character_name,
          image_url: "",
          abilities: [],
          conversation_log: [],
          personality: "",
          wins: 0,
          games_played: 0,
          experience: 0,
        },
      ])
      .single();

    if (newError) {
      throw newError;
    }

    return newData;
  }
};

// Helper Function: Award Achievement
const awardAchievement = async (user_id, character_id, achievement) => {
  const { error } = await supabase
    .from("aibeasts_achievements")
    .insert([
      {
        name: achievement.name,
        description: achievement.description,
        criteria: achievement.criteria,
        awarded_to: user_id,
        character_id,
      },
    ]);

  if (error) {
    console.error("Error awarding achievement:", error.message);
  }
};

// Serverless Handler for /api/training
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user_id, character_name, message } = req.body;

  if (!user_id || !character_name || !message) {
    return res.status(400).json({ error: "user_id, character_name, and message are required" });
  }

  try {
    const character = await getOrCreateCharacter(user_id, character_name);

    const updatedConversation = [...character.conversation_log, { sender: "user", text: message }];

    const openaiMessages = [
      {
        role: "system",
        content: "You are an assistant that helps train monsters in a chaotic battle game.",
      },
      ...updatedConversation.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      })),
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

    const finalConversation = [...updatedConversation, { sender: "assistant", text: aiResponse }];

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
