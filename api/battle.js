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
    let battleLog = [];

    const beast1Details = `
      Name: ${userBeast.name}
      Personality: ${userBeast.personality.join(", ")}
      Abilities: ${userBeast.abilities.join(", ")}
      Physic: ${userBeast.physic.join(", ")}
    `;

    const beast2Details = `
      Name: ${aiBeast.name}
      Personality: ${aiBeast.personality.join(", ")}
      Abilities: ${aiBeast.abilities.join(", ")}
      Physic: ${aiBeast.physic.join(", ")}
    `;

    for (let round = 1; round <= 5; round++) {
      // 🧠 AI 1 (User's Beast)
      const responseAI1 = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: `You are ${userBeast.name}, a beast fighting against other beast with the goal to win the battle. Max 1 sentence. You can use abilities, personality, and physique to win the battle. You MUST NOT say the name of the opponent.` },
          { role: "user", content: `Opponent: ${aiBeast.name}. Fight back and win the game!\n\n${beast1Details}` },
          ...battleLog.map(line => ({ role: "user", content: line }))
        ],
        temperature: 0.7,
        max_tokens: 50, // ⏳ Keep arguments short
      });

      let ai1Message = responseAI1.choices[0].message.content.trim();
      ai1Message = ai1Message.replace(new RegExp(`^${userBeast.name}:?`, "i"), "").trim(); // 🛠️ Remove redundant name
      battleLog.push(`${userBeast.name}: ${ai1Message}`);

      // 🤖 AI 2 (Opponent's Beast)
      const responseAI2 = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: `You are ${userBeast.name}, a beast fighting against other beast with the goal to win the battle. Max 1 sentence. You can use abilities, personality, and physique to win the battle. You MUST NOT say the name of the opponent.` },
          { role: "user", content: `Opponent said: "${ai1Message}". Fight back and win the game\n\n${beast2Details}` },
          ...battleLog.map(line => ({ role: "user", content: line }))
        ],
        temperature: 0.7,
        max_tokens: 50, // ⏳ Keep responses short
      });

      let ai2Message = responseAI2.choices[0].message.content.trim();
      ai2Message = ai2Message.replace(new RegExp(`^${aiBeast.name}:?`, "i"), "").trim(); // 🛠️ Remove redundant name
      battleLog.push(`${aiBeast.name}: ${ai2Message}`);
    }

    // 🎤 AI Referee Judges the Battle
    const responseReferee = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: `You are an impartial AI referee judging a logic battle. Analyze which beast used its abilities, personality, and physique most effectively. Provide a 2-3 sentence summary before declaring a winner.Declare the winner.` },
        { role: "user", content: `Battle log:\n\n${battleLog.join("\n")}\n\nWho wins? Explain why before naming the winner.` }
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const refereeDecision = responseReferee.choices[0].message.content.trim();

    res.status(200).json({
      transcript: battleLog.join("\n"),
      winnerExplanation: refereeDecision, // 🎤 Referee explains before declaring a winner
    });
  } catch (error) {
    console.error("Error generating battle:", error);
    res.status(500).json({ error: "Failed to generate battle." });
  }
};
