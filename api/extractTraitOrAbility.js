import openai from "../openaiClient.js";

/**
 * Extract a concise trait and determine its type from the user's input.
 * Also checks if the user wants to stop the conversation or if the message is conversational.
 * @param {string} userMessage - The full message from the user.
 * @param {string} basisPrompt - The AI's basis prompt for context.
 * @returns {object} - An object containing the traitType, trait, and stopIntent.
 */
async function extractTraitOrAbility(userMessage, basisPrompt) {
  const systemPrompt = {
    role: "system",
    content: `
      ${basisPrompt}
      Your task is to:
      1. Classify the user's message into one of four categories: "abilities," "personality," "physic," or "conversation."
         - "physic": Related to physical appearance (e.g., "robotic dog," "big wings," "shiny fur").
         - "abilities": Related to skills or powers (e.g., "can fly," "invisibility," "fire breath").
         - "personality": Related to behavior or traits (e.g., "kind," "aggressive," "friendly").
         - "conversation": General conversational input (e.g., "Who are you?" or "Tell me about yourself").
      2. Extract a concise text or phrase that describes the relevant trait or the user's intent.
      3. Determine if the user wants to stop the conversation.

      Examples:
      - Input: "I want my monster to have big wings."
        Output: { "traitType": "physic", "trait": "big wings", "stopIntent": false }
      - Input: "Can my beast shoot fire?"
        Output: { "traitType": "abilities", "trait": "fire breath", "stopIntent": false }
      - Input: "Who are you?"
        Output: { "traitType": "conversation", "trait": null, "stopIntent": false }
      - Input: "No, that's it for now."
        Output: { "traitType": null, "trait": null, "stopIntent": true }

      Respond in this JSON format:
      {
        "traitType": "<abilities/personality/physic/conversation>",
        "trait": "<extracted trait or null>",
        "stopIntent": <true/false>
      }
    `,
  };

  const userPrompt = {
    role: "user",
    content: `Message: "${userMessage}"`,
  };

  try {
    // Call OpenAI to classify, extract, and check intent
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [systemPrompt, userPrompt],
      temperature: 0.5, // Lower for consistent responses
      max_tokens: 150,
    });

    const response = completion.choices[0].message.content.trim();
    const parsed = JSON.parse(response);

    if (!parsed.traitType || parsed.stopIntent === undefined) {
      throw new Error("AI response is incomplete or invalid.");
    }

    return parsed; // e.g., { traitType: "conversation", trait: null, stopIntent: false }
  } catch (error) {
    console.error("Error extracting trait or intent:", error.message);
    return { traitType: "conversation", trait: null, stopIntent: false }; // Default to conversation if there's an error
  }
}

export default extractTraitOrAbility;
