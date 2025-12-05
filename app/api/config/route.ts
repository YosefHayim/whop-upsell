import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import type { DownsellConfig } from "@/lib/config";
import { defaultConfig, mergeConfig } from "@/lib/config";

const CONFIG_FILE = path.join(process.cwd(), ".whop-downsell-config.json");

// Ensure config directory exists
async function ensureConfigFile() {
  if (!existsSync(CONFIG_FILE)) {
    await writeFile(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), "utf-8");
  }
}

// GET - Retrieve current configuration
export async function GET() {
  try {
    await ensureConfigFile();
    const configData = await readFile(CONFIG_FILE, "utf-8");
    const config = JSON.parse(configData) as DownsellConfig;
    return NextResponse.json(config);
  } catch (error: unknown) {
    console.error("Error reading config:", error);
    // Return default config if file doesn't exist or is invalid
    return NextResponse.json(defaultConfig);
  }
}

// POST - Update configuration
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<DownsellConfig>;
    
    // Merge with existing config
    await ensureConfigFile();
    const existingData = await readFile(CONFIG_FILE, "utf-8");
    const existingConfig = JSON.parse(existingData) as DownsellConfig;
    const updatedConfig = mergeConfig({ ...existingConfig, ...body });

    // Save updated config
    await writeFile(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), "utf-8");

    return NextResponse.json({ success: true, config: updatedConfig });
  } catch (error: unknown) {
    console.error("Error updating config:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

