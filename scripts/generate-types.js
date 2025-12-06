#!/usr/bin/env node

// Extract project ref from NEXT_PUBLIC_SUPABASE_URL and generate types
require("dotenv").config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL is not set in .env");
  process.exit(1);
}

// Extract project ref from URL: https://[project-ref].supabase.co
const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);

if (!match) {
  console.error("❌ Could not extract project ref from NEXT_PUBLIC_SUPABASE_URL");
  console.error("   Expected format: https://[project-ref].supabase.co");
  process.exit(1);
}

const projectRef = match[1];
console.log(`📦 Using project ref: ${projectRef}`);

// Execute supabase CLI command
const { execSync } = require("child_process");

try {
  console.log("🔄 Generating TypeScript types...");
  execSync(`supabase gen types typescript --project-id ${projectRef} > lib/database.types.ts`, {
    stdio: "inherit",
    env: process.env,
  });
  console.log("✅ Types generated successfully at lib/database.types.ts");
} catch (error) {
  console.error("❌ Failed to generate types:", error.message);
  process.exit(1);
}
