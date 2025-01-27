import dotenv from "dotenv";
dotenv.config();

import express from "express";
import openai from "../openaiClient.js"; // Import OpenAI client from openaiClient.js
import { supabase } from "../supabaseClient.js"; // Import your Supabase client

const router = express.Router();

/**
 * Helper Function: Retrieve or Create AI Beast (Character)
 */
const getOrCreateCharacter = async (user_id, character_name) => {
  const { data, error } = await supabase
    .from("aibeasts_characters")
    .select("*")
    .eq("user_id", user_id)
    .eq("name", character_name)
    .single();

  if (error && error.code !== "PGRST116") {
    // 116: No rows found
    throw error;
  }

  if (data) {
    return data;
  } else {
    // Create a new character if not found
    const { data: newData, error: newError } = await supabase
      .from("aibeasts_characters")
      .insert([
        {
          user_id,
          name: character_name,
          image_url: "", // Placeholder for now
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

/**
 * Helper Function: Award Achievement
 */
const awardAchievement = async (user_id, character_id, achievement) => {
  const { data, error } = await supabase
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

  return data;
};

/**
 * POST /api/training
 * Body: { user_id: string, character_name: string, message: string }
 */
router.post("/", async (req, res) => {
  const { user_id, character_name, message } = req.body;

  if (!user_id || !character_name || !message) {
    return res.status(400).json({ error: "user_id, character_name, and message are required" });
  }

  try {
    // Retrieve or create the character
    const character = await getOrCreateCharacter(user_id, character_name);

    // Append user message to conversation_log
    const updatedConversation = [...character.conversation_log, { sender: "user", text: message }];

    // Prepare conversation for OpenAI
    const openaiMessages = [
      {
        role: "system",
        content: "You are an assistant that helps train monsters in a chaotic battle game. Maintain a friendly and informative tone.",
      },
      ...updatedConversation.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      })),
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or 'gpt-4' if available
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
    });

    const aiResponse = completion.choices[0].message.content.trim();

    // Append AI response to conversation_log
    const finalConversation = [...updatedConversation, { sender: "assistant", text: aiResponse }];

    // Update conversation_log in Supabase
    const { error: updateError } = await supabase
      .from("aibeasts_characters")
      .update({ conversation_log: finalConversation })
      .eq("id", character.id);

    if (updateError) {
      throw updateError;
    }

    // Optional: Parse AI response for updates (abilities, personality, etc.)
    const abilityRegex = /has learned '(.+?)'/;
    const abilityMatch = aiResponse.match(abilityRegex);

    let updatedAbilities = character.abilities;

    if (abilityMatch && abilityMatch[1]) {
      const newAbility = abilityMatch[1];
      if (!updatedAbilities.includes(newAbility)) {
        updatedAbilities = [...updatedAbilities, newAbility];
      }
    }

    const personalityRegex = /personality has become '(.+?)'/;
    const personalityMatch = aiResponse.match(personalityRegex);

    let updatedPersonality = character.personality;

    if (personalityMatch && personalityMatch[1]) {
      updatedPersonality = personalityMatch[1];
    }

    // Update abilities and personality
    if (updatedAbilities !== character.abilities || updatedPersonality !== character.personality) {
      const { error: attrUpdateError } = await supabase
        .from("aibeasts_characters")
        .update({
          abilities: updatedAbilities,
          personality: updatedPersonality,
        })
        .eq("id", character.id);

      if (attrUpdateError) {
        throw attrUpdateError;
      }
    }

    // Increment stats
    const incrementExperience = 10;
    const newGamesPlayed = character.games_played + 1;
    const newExperience = character.experience + incrementExperience;

    const { error: statsUpdateError } = await supabase
      .from("aibeasts_characters")
      .update({
        games_played: newGamesPlayed,
        experience: newExperience,
      })
      .eq("id", character.id);

    if (statsUpdateError) {
      throw statsUpdateError;
    }

    // Check achievements
    if (newGamesPlayed === 10) {
      await awardAchievement(user_id, character.id, {
        name: "Battle Novice",
        description: "Participated in 10 battles.",
        criteria: { type: "games_played", value: 10 },
      });
    }

    if (newExperience >= 100) {
      await awardAchievement(user_id, character.id, {
        name: "Experienced Fighter",
        description: "Accumulated 100 experience points.",
        criteria: { type: "experience", value: 100 },
      });
    }

    // Respond to frontend
    res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error("Error in /api/training:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
