import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../supabaseClient.js";

// Helper: Generate JWT
const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Serverless Handler for /api/auth
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email, and password are required." });
  }

  try {
    // Check if the user exists
    const { data: user, error: selectError } = await supabase
      .from("aibeasts_users")
      .select("*")
      .eq("username", username)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Error checking user existence:", selectError);
      return res.status(500).json({ error: "Error checking user existence." });
    }

    if (user) {
      // Verify the password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (isPasswordValid) {
        // Generate JWT and return it
        const token = generateToken(user);
        return res.status(200).json({ token, message: "Login successful." });
      } else {
        return res.status(401).json({ error: "Invalid password." });
      }
    } else {
      // Hash the password and create a new user
      const hashedPassword = await bcrypt.hash(password, 10);

      const { data: newUser, error: insertError } = await supabase
        .from("aibeasts_users")
        .insert([
          {
            username,
            email,
            password_hash: hashedPassword,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting user into Supabase:", insertError);
        return res.status(500).json({ error: "Error creating user." });
      }

      // Generate JWT for the new user
      const token = generateToken(newUser);
      return res.status(201).json({ token, message: "User registered successfully." });
    }
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(500).json({ error: "Internal Server Error." });
  }
}
