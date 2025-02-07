import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken"; // For JWT validation
import openai from "../openaiClient.js"; // Import OpenAI client
import { supabase } from "../supabaseClient.js"; // Import Supabase client
import extractTraitOrAbility from "./extractTraitOrAbility.js"; // Our custom parser function

// Helper Function: Retrieve or Create AI Beast (Character)
const getOrCreateCharacter = async (user_id, character_name = null) => {
  // Use maybeSingle() to return a row if it exists or null if it doesn't
  const { data, error } = await supabase
    .from("aibeasts_characters")
    .select("*")
    .eq("user_id", user_id)
    .maybeSingle();

  if (error) {
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
          image_url: "",
          abilities: [],
          personality: [],
          physic: [],
          wins: 0,
          games_played: 0,
          experience: 0,
        },
      ])
      .select()
      .maybeSingle();

    if (insertError) {
      throw insertError;
    }

    return newCharacter;
  }

  // If no character exists and no name is provided
  return null;
};

// Function to generate the basis prompt for AI context
const generateBasisPrompt = (character) => {
  const { name, abilities, personality, physic } = character;
  return `You are named ${name}, a unique AI beast.
Your physical appearance includes: ${physic.length > 0 ? physic.join(", ") : "unspecified"}.
Your abilities include: ${abilities.length > 0 ? abilities.join(", ") : "none yet"}.
Your personality traits are: ${personality.length > 0 ? personality.join(", ") : "still developing"}.
Always respond as if you are this character, and help guide the user in training and improving you.`;
};

// Function to generate a follow-up question dynamically using the basis prompt
const generateFollowUpQuestion = async (traitType, trait, basisPrompt) => {
  const systemPrompt = {
    role: "system",
    content: `${basisPrompt}
Based on the trait type and trait provided, generate a relevant follow-up question if necessary.

Examples:
- Trait Type: "physic", Trait: "big wings"
  Question: "What color should the big wings be?"
- Trait Type: "abilities", Trait: "fire breath"
  Question: "How does the fire breath work in combat?"
- Trait Type: "personality", Trait: "brave"
  Question: "Can you describe a situation where being brave would be helpful?"

If no follow-up question is needed, respond with: "No follow-up needed."

Respond in this JSON format:
{
  "question": "<follow-up question or 'No follow-up needed'>"
}`,
  };

  const userPrompt = {
    role: "user",
    content: `Trait Type: "${traitType}", Trait: "${trait}"`,
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [systemPrompt, userPrompt],
      temperature: 0.5,
      max_tokens: 60,
    });

    const response = completion.choices[0].message.content.trim();
    const parsed = JSON.parse(response);
    return parsed.question !== "No follow-up needed" ? parsed.question : null;
  } catch (error) {
    console.error("Error generating follow-up question:", error.message);
    return null; // Default to no follow-up if there's an error
  }
};

// Helper function to deduplicate an array (preserving original casing)
const deduplicate = (arr) => {
  return arr.reduce((acc, curr) => {
    if (!acc.some(item => item.trim().toLowerCase() === curr.trim().toLowerCase())) {
      acc.push(curr);
    }
    return acc;
  }, []);
};

// Helper function to get unique matches with exact match preference.
const getUniqueMatches = (currentArray, requested) => {
  const uniqueCurrent = deduplicate(currentArray);
  const cleanedRequested = requested.trim().toLowerCase();
  // If there's an exact match, use that.
  const exactMatch = uniqueCurrent.find(item => item.trim().toLowerCase() === cleanedRequested);
  if (exactMatch) {
    return [exactMatch];
  }
  // Otherwise, return fuzzy matches.
  return uniqueCurrent.filter(item => item.trim().toLowerCase().includes(cleanedRequested));
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

    // Try to retrieve an existing beast
    let character = await getOrCreateCharacter(user_id);

    // If no beast exists yet...
    if (!character) {
      if (!message) {
        return res.status(200).json({
          response: "Welcome to AIBeasts Game. What do you want to call your new beast?"
        });
      } else {
        character = await getOrCreateCharacter(user_id, message);
        return res.status(200).json({
          response: `I am ${character.name}. Please teach me something, change my appearance or my personality.`
        });
      }
    }

    let basisPrompt = generateBasisPrompt(character);
    const traitData = await extractTraitOrAbility(message, basisPrompt);
    const { traitType, trait, stopIntent } = traitData;

    if (stopIntent) {
      return res.status(200).json({
        response: "Alright, let me know if you want to train your beast further!",
      });
    }

    if (traitType === "conversation") {
      const openaiResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: basisPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 150,
      });
      const assistantReply = openaiResponse.choices[0].message.content.trim();
      return res.status(200).json({ response: assistantReply });
    }

    if (traitType === "name") {
      const { error: updateError } = await supabase
        .from("aibeasts_characters")
        .update({ name: trait })
        .eq("id", character.id);
      if (updateError) {
        throw new Error("Error updating character name in Supabase: " + updateError.message);
      }
      character.name = trait;
      basisPrompt = generateBasisPrompt(character);
      return res.status(200).json({
        response: `Your beast's name has been updated to "${trait}".`
      });
    }

    // ----- REMOVAL BLOCKS -----

    // Removal of personality traits
    if (traitType === "remove_personality") {
      const currentTraits = Array.isArray(character.personality) ? character.personality : [];
      const uniqueMatches = getUniqueMatches(currentTraits, trait);
      if (uniqueMatches.length === 0) {
        return res.status(200).json({
          response: `No personality trait similar to "${trait}" was found in your beast's personality.`
        });
      } else if (uniqueMatches.length === 1) {
        const updatedPersonality = currentTraits.filter(item =>
          item.trim().toLowerCase() !== uniqueMatches[0].trim().toLowerCase()
        );
        const { error: updateError } = await supabase
          .from("aibeasts_characters")
          .update({ personality: updatedPersonality })
          .eq("id", character.id);
        if (updateError) {
          throw new Error("Error removing personality trait in Supabase: " + updateError.message);
        }
        character.personality = updatedPersonality;
        basisPrompt = generateBasisPrompt(character);
        return res.status(200).json({
          response: `Removed "${uniqueMatches[0]}" from your beast's personality.`,
        });
      } else {
        return res.status(200).json({
          response: `Multiple personality traits match your request: ${uniqueMatches.join(", ")}. Please specify which one you want to remove.`
        });
      }
    }

    // Removal of ability traits
    if (traitType === "remove_ability") {
      const currentAbilities = Array.isArray(character.abilities) ? character.abilities : [];
      const uniqueMatches = getUniqueMatches(currentAbilities, trait);
      if (uniqueMatches.length === 0) {
        return res.status(200).json({
          response: `No ability similar to "${trait}" was found in your beast's abilities.`
        });
      } else if (uniqueMatches.length === 1) {
        const updatedAbilities = currentAbilities.filter(item =>
          item.trim().toLowerCase() !== uniqueMatches[0].trim().toLowerCase()
        );
        const { error: updateError } = await supabase
          .from("aibeasts_characters")
          .update({ abilities: updatedAbilities })
          .eq("id", character.id);
        if (updateError) {
          throw new Error("Error removing ability in Supabase: " + updateError.message);
        }
        character.abilities = updatedAbilities;
        basisPrompt = generateBasisPrompt(character);
        return res.status(200).json({
          response: `Removed "${uniqueMatches[0]}" from your beast's abilities.`,
        });
      } else {
        return res.status(200).json({
          response: `Multiple abilities match your request: ${uniqueMatches.join(", ")}. Please specify which one you want to remove.`
        });
      }
    }

    // Removal of physic traits
    if (traitType === "remove_physic") {
      const currentPhysic = Array.isArray(character.physic) ? character.physic : [];
      const uniqueMatches = getUniqueMatches(currentPhysic, trait);
      if (uniqueMatches.length === 0) {
        return res.status(200).json({
          response: `No physical trait similar to "${trait}" was found in your beast's physical traits.`
        });
      } else if (uniqueMatches.length === 1) {
        const updatedPhysic = currentPhysic.filter(item =>
          item.trim().toLowerCase() !== uniqueMatches[0].trim().toLowerCase()
        );
        const { error: updateError } = await supabase
          .from("aibeasts_characters")
          .update({ physic: updatedPhysic })
          .eq("id", character.id);
        if (updateError) {
          throw new Error("Error removing physic trait in Supabase: " + updateError.message);
        }
        character.physic = updatedPhysic;
        basisPrompt = generateBasisPrompt(character);
        return res.status(200).json({
          response: `Removed "${uniqueMatches[0]}" from your beast's physical traits.`,
        });
      } else {
        return res.status(200).json({
          response: `Multiple physical traits match your request: ${uniqueMatches.join(", ")}. Please specify which one you want to remove.`
        });
      }
    }

    // ----- ADDITION BLOCK -----
    // If none of the removal or name cases match, assume it's an addition.
    const updatedTraits = {
      [traitType]: [
        ...(Array.isArray(character[traitType]) ? character[traitType] : []),
        trait,
      ],
    };

    const { error: updateError } = await supabase
      .from("aibeasts_characters")
      .update(updatedTraits)
      .eq("id", character.id);
    if (updateError) {
      throw new Error("Error updating character in Supabase: " + updateError.message);
    }
    const followUpQuestion = await generateFollowUpQuestion(traitType, trait, basisPrompt);
    return res.status(200).json({
      response: `Added "${trait}" as a new ${traitType}. ${followUpQuestion || ""}`,
    });
  } catch (error) {
    console.error("Error in /api/training:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
