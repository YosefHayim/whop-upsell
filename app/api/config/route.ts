import { NextRequest, NextResponse } from "next/server";
import { defaultConfig, mergeConfig } from "@/lib/config";

import type { DownsellConfig } from "@/lib/config";
import { getSupabase } from "@/lib/supabase";
import { verifyUserToken } from "@/lib/whop-sdk";

// GET - Retrieve configuration for a company/experience
export async function GET(request: NextRequest) {
  try {
    const { userId } = await verifyUserToken();
    const supabase = getSupabase();

    // Get company_id and experience_id from query params
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("companyId");
    const experienceId = searchParams.get("experienceId");

    if (!companyId) {
      // If no company ID, return default config
      return NextResponse.json(defaultConfig);
    }

    // Try to fetch existing config from Supabase
    const { data, error } = await supabase
      .from("user_configs")
      .select("config")
      .eq("company_id", companyId)
      .eq("user_id", userId)
      .eq("experience_id", experienceId || null)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" which is fine, we'll use default
      console.error("Error fetching config from Supabase:", error);
    }

    if (data?.config) {
      // Merge with defaults to ensure all fields are present
      const config = mergeConfig(data.config as Partial<DownsellConfig>);
      return NextResponse.json(config);
    }

    // Return default config if none found
    return NextResponse.json(defaultConfig);
  } catch (error: unknown) {
    console.error("Error reading config:", error);
    // Return default config on error
    return NextResponse.json(defaultConfig);
  }
}

// POST - Update configuration for a company/experience
export async function POST(request: NextRequest) {
  try {
    const { userId } = await verifyUserToken();
    const supabase = getSupabase();

    const body = (await request.json()) as {
      config?: Partial<DownsellConfig>;
      companyId: string;
      experienceId?: string;
    };

    const { config: partialConfig, companyId, experienceId } = body;

    if (!companyId) {
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    }

    // Get existing config or use default
    const { data: existingData } = await supabase
      .from("user_configs")
      .select("config")
      .eq("company_id", companyId)
      .eq("user_id", userId)
      .eq("experience_id", experienceId || null)
      .maybeSingle();

    const existingConfig = existingData?.config ? (existingData.config as Partial<DownsellConfig>) : {};
    const updatedConfig = mergeConfig({ ...existingConfig, ...partialConfig });

    // Upsert config in Supabase
    const { error: upsertError } = await supabase.from("user_configs").upsert(
      {
        company_id: companyId,
        experience_id: experienceId || null,
        user_id: userId,
        config: updatedConfig,
      },
      {
        onConflict: "company_id,experience_id,user_id",
      }
    );

    if (upsertError) {
      console.error("Error saving config to Supabase:", upsertError);
      return NextResponse.json({ error: "Failed to save configuration" }, { status: 500 });
    }

    return NextResponse.json({ success: true, config: updatedConfig });
  } catch (error: unknown) {
    console.error("Error updating config:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
