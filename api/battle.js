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

    const totalRounds = 5;
    for (let round = 1; round <= totalRounds; round++) {
      // Add a header for the round.
      battleLog.push(`Round ${round}:`);

      if (round % 2 === 1) {
        // === SIMULTANEOUS ROUND (odd rounds: 1, 3, 5) ===

        // Generate Beast #1's move independently.
        const responseAI1 = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are ${userBeast.name}. Generate a single, powerful move (one sentence) for round ${round} based solely on your personality, abilities, and physique. Do not mention or react to your opponent.`,
            },
            {
              role: "user",
              content: `${beast1Details}\nRound ${round} context: Previous moves:\n${battleLog.join("\n") || "None"}`,
            },
          ],
          temperature: 0.5,
          max_tokens: 50,
        });
        let move1 = responseAI1.choices[0].message.content.trim();
        move1 = move1.replace(new RegExp(`^${userBeast.name}:?`, "i"), "").trim();

        // Generate Beast #2's move independently.
        const responseAI2 = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are ${aiBeast.name}. Generate a single, powerful move (one sentence) for round ${round} based solely on your personality, abilities, and physique. Do not mention or react to your opponent.`,
            },
            {
              role: "user",
              content: `${beast2Details}\nRound ${round} context: Previous moves:\n${battleLog.join("\n") || "None"}`,
            },
          ],
          temperature: 0.5,
          max_tokens: 50,
        });
        let move2 = responseAI2.choices[0].message.content.trim();
        move2 = move2.replace(new RegExp(`^${aiBeast.name}:?`, "i"), "").trim();

        // Append each beast's move.
        battleLog.push(`${userBeast.name}: ${move1}`);
        battleLog.push(`${aiBeast.name}: ${move2}`);

      } else {
        // === SEQUENTIAL ROUND (even rounds: 2 and 4) ===
        // Determine starting beast: alternate starting order.
        let startingBeast, secondBeast;
        if (round % 4 === 2) {
          startingBeast = userBeast;
          secondBeast = aiBeast;
        } else {
          startingBeast = aiBeast;
          secondBeast = userBeast;
        }

        // Generate a sequential exchange of 4 moves.
        // Instruct GPT to produce exactly 4 moves (plain sentences, no beast names).
        const seqResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a battle narrative generator. For round ${round}, generate exactly 4 moves (each one sentence) representing a sequential exchange between two beasts. Do not include any proper names or pronouns that indicate who is speaking—simply output the moves as plain sentences, one per line.`,
            },
            {
              role: "user",
              content: `Beast 1 details: ${beast1Details}\nBeast 2 details: ${beast2Details}\nGenerate exactly 4 moves for this round.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 150,
        });
        const seqText = seqResponse.choices[0].message.content.trim();
        const seqMoves = seqText.split(/\n+/).map(line => line.trim()).filter(line => line.length > 0);
        while (seqMoves.length < 4) seqMoves.push("...");

        // Now assign beast names based on starting order.
        let roundMoves = [];
        if (startingBeast.name === userBeast.name) {
          // Order: Beast1, Beast2, Beast1, Beast2.
          roundMoves.push(`${userBeast.name}: ${seqMoves[0]}`);
          roundMoves.push(`${aiBeast.name}: ${seqMoves[1]}`);
          roundMoves.push(`${userBeast.name}: ${seqMoves[2]}`);
          roundMoves.push(`${aiBeast.name}: ${seqMoves[3]}`);
        } else {
          // Order: Beast2, Beast1, Beast2, Beast1.
          roundMoves.push(`${aiBeast.name}: ${seqMoves[0]}`);
          roundMoves.push(`${userBeast.name}: ${seqMoves[1]}`);
          roundMoves.push(`${aiBeast.name}: ${seqMoves[2]}`);
          roundMoves.push(`${userBeast.name}: ${seqMoves[3]}`);
        }

        roundMoves.forEach(move => battleLog.push(move));
      }
    }

    // --- AI Referee Judges the Overall Battle ---
    const responseReferee = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an impartial AI referee. Evaluate the following battle transcript (divided into rounds with individual moves from each beast) and provide a 2-3 sentence explanation of which beast performed best overall. Then, on a new line, output exactly:
The winner is <winner beast name>.
with no additional text.`,
        },
        {
          role: "user",
          content: `Battle Transcript:\n\n${battleLog.join("\n")}\n\nExplain your reasoning and then output the result as described.`,
        },
      ],
      temperature: 0.6,
      max_tokens: 150,
    });

    const refereeOutput = responseReferee.choices[0].message.content.trim();
    // Expect the final line to be in the format: "The winner is "<winner beast name>.""
    // We extract the winner by finding the line starting with "The winner is".
    const refereeLines = refereeOutput.split("\n").map(line => line.trim());
    const winnerLine = refereeLines.find(line => line.startsWith("The winner is"));
    let winnerName = "";
    if (winnerLine) {
      // Remove "The winner is" and any surrounding quotes or punctuation.
      winnerName = winnerLine.replace("The winner is", "").replace(/[".]/g, "").trim();
    }

    let winnerId = null;
    let character_winner = winnerName;
    const userBeastNameLC = userBeast.name.trim().toLowerCase();
    const aiBeastNameLC = aiBeast.name.trim().toLowerCase();
    const user1 = getUserId(authHeader);    // The user who joined (Player 1)
    const user2 = lobbyDetails.created_by;  // Lobby creator (Player 2)

    if (winnerName.toLowerCase() === userBeastNameLC) {
      winnerId = user1;
    } else if (winnerName.toLowerCase() === aiBeastNameLC) {
      winnerId = user2;
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

    // --- Call the Smart Contract to Pay the Winner (if bet > 0) ---
    const betAmount = lobbyDetails.bet_amount || 0;
    if (betAmount > 0) {
      console.log("Bet detected, sending payment to winner...");
      const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_SEPOLIA_ENDPOINT);
      const ownerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      const contract = new ethers.Contract(
        process.env.VITE_SEPOLIA_BATTLE_CONTRACT,
        BattleBetABI.abi,
        ownerWallet
      );

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
      message: "Battle completed (round-by-round interactions generated).",
    });
  } catch (error) {
    console.error("Error generating battle:", error);
    res.status(500).json({ error: "Failed to generate battle." });
  }
}
