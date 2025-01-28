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
          : "Welcome to AIBeasts Game. What do you want to call your new beast?",
      });
    }

    // Helper: Analyze the message for training categories
    const analyzeMessage = (message) => {
      if (/ability|can/i.test(message)) {
        return { type: "ability", value: message.trim() };
      } else if (/personality|trait|feeling|emotion/i.test(message)) {
        return { type: "personality", value: message.trim() };
      } else if (/physic|looks|appearance|body/i.test(message)) {
        return { type: "physic", value: message.trim() };
      }
      return { type: "general" };
    };

    const analysis = analyzeMessage(message);

    // Update Supabase based on analysis
    const updateFields = {};

    if (analysis.type === "ability") {
      updateFields.abilities = [...(character.abilities || []), analysis.value];
    } else if (analysis.type === "personality") {
      updateFields.personality = [...(character.personality || []), analysis.value];
    } else if (analysis.type === "physic") {
      updateFields.physic = [...(character.physic || []), analysis.value];
    }

    const updatedConversationLog = [
      ...(character.conversation_log || []),
      { sender: "user", text: message.trim() },
    ];

    // Update conversation_log and relevant fields
    const { error: updateError } = await supabase
      .from("aibeasts_characters")
      .update({
        ...updateFields,
        conversation_log: updatedConversationLog,
      })
      .eq("id", character.id);

    if (updateError) {
      throw new Error("Error updating character in Supabase.");
    }

    // Clean conversation log for OpenAI
    const cleanedConversationLog = updatedConversationLog.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text.trim(),
    }));

    const openaiMessages = [
      { role: "system", content: "You are a beast in training guided by your master." },
      ...cleanedConversationLog,
      { role: "user", content: message.trim() },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 90,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
    });

    const aiResponse = completion.choices[0].message.content.trim();

    // Append AI response to conversation log
    const finalConversationLog = [
      ...updatedConversationLog,
      { sender: "assistant", text: aiResponse },
    ];

    // Update conversation log with AI response
    await supabase
      .from("aibeasts_characters")
      .update({ conversation_log: finalConversationLog })
      .eq("id", character.id);

    res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error("Error in /api/training:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
