import openai from "../openaiClient.js"; // OpenAI Client
import { supabase } from "../supabaseClient.js"; // Supabase Client

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userBeast, aiBeast } = req.body;

  if (!userBeast || !aiBeast) {
    return res.status(400).json({ error: "Missing beast data." });
  }

  try {
    // System Prompt: Define battle behavior
    const systemPrompt = `
      You are an AI referee overseeing a battle of reasoning between two beasts. 
      Each turn, one beast makes a statement explaining why they are superior.
      The other beast must respond with logic, strategy, or clever counterarguments.
      The goal is NOT to attack, but to **outthink and outmaneuver** the opponent.
      
      **Rules:**
      - Beasts must use their **abilities**, **personality**, and **physic** as arguments.
      - No repeating arguments.
      - The battle lasts until a winner is chosen by you.
      - At the end, pick a **clear winner** based on who argued better.

      **Example:**
      - Beast 1: "My fire breath is unstoppable, reducing everything to ashes!"
      - Beast 2: "Foolish! My scales absorb heat and turn it into energy!"
      - Beast 1: "Then I shall use my speed to attack before you can react!"
      - Beast 2: "A clever move, but I anticipated that. My reflexes allow me to dodge!"

      The battle ends with a **winner** based on the best reasoning.
    `;

    // Prepare Messages
    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Beast 1 (Player): ${userBeast.name}
        - Personality: ${JSON.stringify(userBeast.personality)}
        - Abilities: ${JSON.stringify(userBeast.abilities)}
        - Physic: ${JSON.stringify(userBeast.physic)}

        Beast 2 (AI Opponent): ${aiBeast.name}
        - Personality: ${JSON.stringify(aiBeast.personality)}
        - Abilities: ${JSON.stringify(aiBeast.abilities)}
        - Physic: ${JSON.stringify(aiBeast.physic)}

        Begin the battle!`,
      },
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.8,
      max_tokens: 500,
    });

    const battleTranscript = completion.choices[0].message.content.trim();

    // Return battle transcript to frontend
    res.status(200).json({ transcript: battleTranscript });
  } catch (error) {
    console.error("Error generating battle:", error);
    res.status(500).json({ error: "Failed to generate battle." });
  }
}
