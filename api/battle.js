import openai from "../openaiClient.js"; // OpenAI Client
import { supabase } from "../supabaseClient.js"; // Supabase Client
import { v4 as uuidv4 } from "uuid"; // For generating UUIDs if needed

// Helper function to extract user ID from the authorization header.
const getUserId = (authorization) => {
  try {
    if (!authorization) throw new Error("No token provided.");
    const token = authorization.split(" ")[1];
    if (!token) throw new Error("No token found.");
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    return decodedToken.id;
  } catch (err) {
    console.error("Error extracting user ID:", err.message);
    return null;
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Ensure the Authorization header exists.
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided." });
  }

  const { userBeast, aiBeast, lobbyDetails } = req.body;
  if (!userBeast || !aiBeast || !lobbyDetails) {
    return res.status(400).json({ error: "Missing beast or lobby data." });
  }

  try {
    let battleLog = [];

    // Construct beast details strings.
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
      // --- AI 1 (User's Beast) ---
      const responseAI1 = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are ${userBeast.name}, a beast fighting against another beast with the goal to win the battle. You do not give up. Max 1 sentence. Use your abilities, personality, and physique effectively.`
          },
          {
            role: "user",
            content: `Opponent: ${aiBeast.name}. Fight back and win the game!\n\n${beast1Details}`
          },
          ...battleLog.map(line => ({ role: "user", content: line }))
        ],
        temperature: 0.7,
        max_tokens: 50,
      });

      let ai1Message = responseAI1.choices[0].message.content.trim();
      ai1Message = ai1Message.replace(new RegExp(`^${userBeast.name}:?`, "i"), "").trim();
      battleLog.push(`${userBeast.name}: ${ai1Message}`);

      // --- AI 2 (Opponent's Beast) ---
      const responseAI2 = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are ${aiBeast.name}, a beast fighting against another beast with the goal to win the battle. You do not give up. Max 1 sentence. Use your abilities, personality, and physique effectively.`
          },
          {
            role: "user",
            content: `Opponent said: "${ai1Message}". Fight back and win the game!\n\n${beast2Details}`
          },
          ...battleLog.map(line => ({ role: "user", content: line }))
        ],
        temperature: 0.7,
        max_tokens: 50,
      });

      let ai2Message = responseAI2.choices[0].message.content.trim();
      ai2Message = ai2Message.replace(new RegExp(`^${aiBeast.name}:?`, "i"), "").trim();
      battleLog.push(`${aiBeast.name}: ${ai2Message}`);
    }

    // --- AI Referee Judges the Battle ---
    // Instruct the referee to first provide reasoning, then output on a new line: "The winner is <winner beast name>"
    const responseReferee = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an impartial AI referee judging a logic battle between two beasts. First, provide a 2-3 sentence explanation of which beast used its abilities, personality, and physique most effectively. Then, on a new line, output exactly: "The winner is <winner beast name>" (replace <winner beast name> with the winning beast's name, without any extra punctuation).`
        },
        {
          role: "user",
          content: `Battle log:\n\n${battleLog.join("\n")}\n\nExplain your reasoning and then, on a new line, output exactly "The winner is <winner beast name>".`
        }
      ],
      temperature: 0.6,
      max_tokens: 150,
    });

    const refereeOutput = responseReferee.choices[0].message.content.trim();

    // Find the line that starts with "The winner is"
    let winnerFromRef = null;
    const lines = refereeOutput.split("\n").map(line => line.trim());
    const winnerLine = lines.find(line =>
      line.toLowerCase().startsWith("the winner is")
    );
    if (winnerLine) {
      // Extract the winning beast's name and remove any trailing punctuation.
      winnerFromRef = winnerLine.substring("the winner is".length).trim();
      winnerFromRef = winnerFromRef.replace(/[.,!?]$/, "");
    }

    let winnerId = null;
    // Save the winning beast's name in a new field character_winner.
    let character_winner = null;
    if (winnerFromRef) {
      character_winner = winnerFromRef;
      const userBeastName = userBeast.name.trim().toLowerCase();
      const aiBeastName = aiBeast.name.trim().toLowerCase();
      // Get joiner's user id from the header (user_1)
      const user1 = getUserId(authHeader);
      // Use the lobby creator's id from lobbyDetails as user_2.
      const user2 = lobbyDetails.created_by; // Ensure lobbyDetails.created_by exists

      if (winnerFromRef.toLowerCase() === userBeastName) {
        winnerId = user1;
      } else if (winnerFromRef.toLowerCase() === aiBeastName) {
        winnerId = user2;
      }
    }

    // --- Save the Battle Record ---
    const battleRecord = {
      // Uncomment the next line if your table does NOT auto-generate the id:
      id: uuidv4(),
      character_1: userBeast.name,
      character_2: aiBeast.name,
      character_winner: character_winner, // Save the winning beast's name.
      user_1: getUserId(authHeader),
      user_2: lobbyDetails.created_by,
      winner: winnerId, // The winning user's uuid.
      battle_log: battleLog, // Saved as a JSON array.
      environment: "standard", // Replace with dynamic environment if available.
      winner_wallet: userBeast.wallet || null,
    };

    const { data: battleData, error: battleError } = await supabase
      .from("aibeasts_battles")
      .insert([battleRecord])
      .select();

    if (battleError) {
      console.error("Error saving battle:", battleError.message);
      // Optionally, you can choose whether to return an error or just log this issue.
    }

    res.status(200).json({
      transcript: battleLog.join("\n"),
      winnerExplanation: refereeOutput, // Full output including reasoning and the winner line.
      savedBattle: battleData, // Optionally return saved record details.
    });
  } catch (error) {
    console.error("Error generating battle:", error);
    res.status(500).json({ error: "Failed to generate battle." });
  }
}
