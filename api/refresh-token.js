import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import { supabase } from "../supabaseClient.js";

// Helper: Generate a new JWT
const generateNewToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2000d" });
};

// API Handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.body; // Get old token from request

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    // Verify the existing token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user data from Supabase
    const { data: user, error } = await supabase
      .from("aibeasts_users")
      .select("id, username")
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token or user not found." });
    }

    // Generate a new JWT
    const newToken = generateNewToken(user);
    
    return res.status(200).json({ token: newToken, message: "New token generated successfully." });
  } catch (err) {
    console.error("Token refresh error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
