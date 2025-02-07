import { createClient } from "@supabase/supabase-js";

// Retrieve environment variables using process.env
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables.");
}

// Create a single Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
