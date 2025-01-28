  import dotenv from "dotenv";
  dotenv.config();

  import jwt from "jsonwebtoken"; // For JWT validation
  import openai from "../openaiClient.js"; // Import OpenAI client
  import { supabase } from "../supabaseClient.js"; // Import Supabase client
  import extractTraitOrAbility from "./extractTraitOrAbility.js"; // [NEW CODE] Our custom parser function

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
            image_url: "",
            abilities: [],
            personality: [],
            physic:[],
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

  const generateFollowUpQuestion = async (traitType, trait, basisPrompt) => {
    const systemPrompt = {
      role: "system",
      content: `
        ${basisPrompt}
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
        }
      `,
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
  
  
  

// Function to generate the basis prompt for AI context
const generateBasisPrompt = (character) => {
  const { name, abilities, personality, physic } = character;

  return `
    You are named ${name}, a unique AI beast.
    Your physical appearance includes: ${physic.length > 0 ? physic.join(", ") : "unspecified"}.
    Your abilities include: ${abilities.length > 0 ? abilities.join(", ") : "none yet"}.
    Your personality traits are: ${personality.length > 0 ? personality.join(", ") : "still developing"}.
    Always respond as if you are this character, and help guide the user in training and improving you.
  `;
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

    // Retrieve or create character
    const character = await getOrCreateCharacter(user_id);

    // Generate the basis prompt
    const basisPrompt = generateBasisPrompt(character);

    // Greet if no message
    if (!message) {
      return res.status(200).json({
        response: character
          ? `Welcome back! Your beast is ${character.name}. What are we going to train today?`
          : "Welcome to AIBeasts Game. What do you want to call your new beast?",
      });
    }

    // Extract trait, type, and intent
    const traitData = await extractTraitOrAbility(message);

    if (!traitData) {
      return res.status(400).json({ error: "Unable to interpret the message." });
    }

    const { traitType, trait, stopIntent } = traitData;

    // Handle stop intent
    if (stopIntent) {
      return res.status(200).json({
        response: "Alright, let me know if you want to train your beast further!",
      });
    }

    // Update character with the new trait
    const updatedTraits = {
      [traitType]: [...(character[traitType] || []), trait],
    };

    // Update character in Supabase
    const { error: updateError } = await supabase
      .from("aibeasts_characters")
      .update(updatedTraits)
      .eq("id", character.id);

    if (updateError) {
      throw new Error("Error updating character in Supabase: " + updateError.message);
    }

    // Generate a follow-up question dynamically using the basis prompt
    const followUpQuestion = await generateFollowUpQuestion(traitType, trait, basisPrompt);

    // Pass the basis prompt and user message to OpenAI for a response
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

    // Send success response
    return res.status(200).json({
      response: assistantReply + (followUpQuestion ? ` ${followUpQuestion}` : ""),
    });
  } catch (error) {
    console.error("Error in /api/training:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

