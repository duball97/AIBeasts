import openai from "../openaiClient.js"; // OpenAI Client
import { supabase } from "../supabaseClient.js"; // Supabase Client
import { v4 as uuidv4 } from "uuid"; // For generating UUIDs if needed
import { ethers } from "ethers";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const BattleBetABI = require("../artifacts/contracts/AIBeastsBattle.sol/BattleBet.json");

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
    // **Step 1: Check if the lobby is still open (i.e. no battle record exists)**
    const { data: existingBattle } = await supabase
      .from("aibeasts_battles")
      .select("id")
      .eq("lobby_id", lobbyDetails.id)
      .single();

    if (existingBattle) {
      return res.status(400).json({ error: "This lobby has already been played." });
    }

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

    // We'll track each beast's last message to feed into the next prompt
    let ai1Message = ""; // Beast #1's last statement
    let ai2Message = ""; // Beast #2's last statement

    // Generate 5 rounds of battle dialogue: Beast #1 → Beast #2
    for (let round = 1; round <= 5; round++) {
      // --- AI 1 (User's Beast) ---
      const responseAI1 = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are ${userBeast.name}, a beast fighting against another beast with the goal to win the battle. You do not give up. Max 1 sentence. Keep it short. Use your abilities, personality, and physique effectively.`,
          },
          {
            role: "user",
            content: `Opponent said: "${ai2Message}". Fight back and win the game!\n\n${beast1Details}`,
          },
          // We'll include the previous lines as user content
          ...battleLog.map((line) => ({ role: "user", content: line })),
        ],
        temperature: 0.5,
        max_tokens: 50,
      });

      ai1Message = responseAI1.choices[0].message.content.trim();
      // Remove any leading "[Name]:"
      ai1Message = ai1Message.replace(new RegExp(`^${userBeast.name}:?`, "i"), "").trim();

      // Add to battle log
      battleLog.push(`${userBeast.name}: ${ai1Message}`);

      // --- AI 2 (Opponent's Beast) ---
      const responseAI2 = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are ${aiBeast.name}, a beast fighting against another beast with the goal to win the battle. You do not give up. Max 1 sentence. Keep it short. Use your abilities, personality, and physique effectively.`,
          },
          {
            role: "user",
            content: `Opponent said: "${ai1Message}". Fight back and win the game!\n\n${beast2Details}`,
          },
          ...battleLog.map((line) => ({ role: "user", content: line })),
        ],
        temperature: 0.5,
        max_tokens: 50,
      });

      ai2Message = responseAI2.choices[0].message.content.trim();
      ai2Message = ai2Message.replace(new RegExp(`^${aiBeast.name}:?`, "i"), "").trim();
      battleLog.push(`${aiBeast.name}: ${ai2Message}`);
    }

    // ************************
    // *** EXTRA FINAL MOVE ***
    // ************************
    // Now let Beast #1 (Player 1) have one final line **without** letting Beast #2 respond.
    const finalMoveAI1 = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are ${userBeast.name}, a beast fighting against another beast with the goal to win. This is your final move. Max 1 sentence, keep it short.`,
        },
        {
          role: "user",
          content: `Opponent said: "${ai2Message}". Deliver your last blow!\n\n${beast1Details}`,
        },
        ...battleLog.map((line) => ({ role: "user", content: line })),
      ],
      temperature: 0.5,
      max_tokens: 50,
    });

    let finalAI1Message = finalMoveAI1.choices[0].message.content.trim();
    finalAI1Message = finalAI1Message.replace(new RegExp(`^${userBeast.name}:?`, "i"), "").trim();
    battleLog.push(`${userBeast.name}: ${finalAI1Message}`);

    // --- AI Referee Judges the Battle ---
    const responseReferee = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an impartial AI referee judging a logic battle between two beasts. First, provide a 2-3 sentence explanation of which beast performed best. Then, on a new line, output exactly:
{"winner": "<winner beast name>"}
with no additional text.`,
        },
        {
          role: "user",
          content: `Battle log:\n\n${battleLog.join("\n")}\n\nExplain your reasoning and then output the JSON object as described.`,
        },
      ],
      temperature: 0.6,
      max_tokens: 150,
    });

    const refereeOutput = responseReferee.choices[0].message.content.trim();

    // Parse the JSON object from the referee output.
    let refereeData = null;
    const lines = refereeOutput.split("\n").map((line) => line.trim());
    const jsonLine = lines.find((line) => line.startsWith("{") && line.endsWith("}"));
    if (jsonLine) {
      try {
        refereeData = JSON.parse(jsonLine);
      } catch (e) {
        console.error("Error parsing referee JSON:", e.message);
      }
    }

    let winnerId = null;
    let character_winner = null;
    if (refereeData && refereeData.winner) {
      // Clean the winner name by removing extra punctuation.
      let winnerFromRef = refereeData.winner.trim().replace(/[^a-zA-Z0-9 ]+$/, "");
      character_winner = winnerFromRef;
      const userBeastName = userBeast.name.trim().toLowerCase();
      const aiBeastName = aiBeast.name.trim().toLowerCase();

      const user1 = getUserId(authHeader);    // The user who joined
      const user2 = lobbyDetails.created_by;  // Lobby creator

      if (winnerFromRef.toLowerCase() === userBeastName) {
        winnerId = user1;
      } else if (winnerFromRef.toLowerCase() === aiBeastName) {
        winnerId = user2;
      }
    }

    if (!winnerId) {
      return res.status(400).json({ error: "No winner determined by the AI judge." });
    }

    // --- Fetch the Winner's Wallet Address ---
    let winnerWallet = null;
    if (winnerId) {
      const { data: winnerData, error: winnerError } = await supabase
        .from("aibeasts_users")
        .select("wallet")
        .eq("id", winnerId)
        .single();

      if (winnerError || !winnerData?.wallet) {
        console.warn(`⚠️ Could not fetch wallet for winner ID: ${winnerId}`);
      } else {
        winnerWallet = winnerData.wallet;
        console.log(`🏆 Winner's wallet: ${winnerWallet}`);
      }
    }

    // --- Call the Smart Contract to Pay the Winner ---
    const betAmount = lobbyDetails.bet_amount || 0;
    if (betAmount > 0) {
      console.log("Bet detected, sending payment to winner...");
      const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_SEPOLIA_ENDPOINT);
      const ownerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      const contract = new ethers.Contract(process.env.VITE_SEPOLIA_BATTLE_CONTRACT, BattleBetABI.abi, ownerWallet);

      console.log("Calling contract to declare winner and process payment...");
      const payTx = await contract.declareWinner(lobbyDetails.battlecontract_id, winnerWallet);
      await payTx.wait();
      console.log("Payment successful: Winner has been paid on-chain.");
    } else {
      console.log("Free match detected, skipping on-chain payment.");
    }

    // --- Save the Battle Record ---
    const battleRecord = {
      id: uuidv4(),
      lobby_id: lobbyDetails.id,
      character_1: userBeast.name,
      character_2: aiBeast.name,
      character_winner: character_winner,
      user_1: getUserId(authHeader),
      user_2: lobbyDetails.created_by,
      winner: winnerId,
      battle_log: battleLog,
      judge_log: refereeOutput,
      environment: "standard",
      winner_wallet: winnerWallet || null,
    };

    await supabase.from("aibeasts_battles").insert([battleRecord]);

    // **Step 2: Close the Lobby** (only allow one game per lobby)
    await supabase
      .from("aibeasts_lobbies")
      .update({ lobby_status: "played" })
      .eq("id", lobbyDetails.id);

    res.status(200).json({
      transcript: battleLog.join("\n"),
      judge_log: refereeOutput,
      message: "Battle completed (Player 1 had the final move).",
    });
  } catch (error) {
    console.error("Error generating battle:", error);
    res.status(500).json({ error: "Failed to generate battle." });
  }
}
