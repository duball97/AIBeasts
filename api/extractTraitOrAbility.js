import openai from "../openaiClient.js";

/**
 * Extract a concise trait and determine its type from the user's input.
 * Also checks if the user wants to stop the conversation.
 * @param {string} userMessage - The full message from the user.
 * @returns {object} - An object containing the traitType, trait, and stopIntent.
 */
async function extractTraitOrAbility(userMessage) {
    const systemPrompt = {
        role: "system",
        content: `
          You are an AI that interprets user messages during character training. 
          Your task is to:
          1. Classify the user's message into one of three categories: "abilities", "personality", or "physic".
             - "physic": Related to physical appearance (e.g., "robotic dog", "big wings", "shiny fur").
             - "abilities": Related to skills or powers (e.g., "can fly", "invisibility", "fire breath").
             - "personality": Related to behavior or traits (e.g., "kind", "aggressive", "friendly").
          2. Extract a concise text or phrase that describes the relevant trait.
          3. Determine if the user wants to stop the conversation or add more details.
      
          Examples:
          - Input: "I want my monster to have big wings."
            Output: { "traitType": "physic", "trait": "big wings", "stopIntent": false }
          - Input: "Can my beast shoot fire?"
            Output: { "traitType": "abilities", "trait": "fire breath", "stopIntent": false }
          - Input: "Make my dog look like a robot."
            Output: { "traitType": "physic", "trait": "robotic appearance", "stopIntent": false }
          - Input: "No, that's it for now."
            Output: { "traitType": null, "trait": null, "stopIntent": true }
      
          Respond in this JSON format:
          {
            "traitType": "<abilities/personality/physic>",
            "trait": "<extracted trait>",
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
      max_tokens: 80, // Adjust to fit concise JSON responses
    });

    // Parse and return the response
    const response = completion.choices[0].message.content.trim();
    const parsed = JSON.parse(response);

    if (!parsed.traitType || parsed.stopIntent === undefined) {
      throw new Error("AI response is incomplete or invalid.");
    }

    return parsed; // { traitType: "physic", trait: "big wings", stopIntent: false }
  } catch (error) {
    console.error("Error extracting trait or intent:", error.message);
    return null; // Return null to handle fallback logic in the main flow
  }
}

export default extractTraitOrAbility;
