import { NextRequest, NextResponse } from "next/server";

import Whop from "@whop/sdk";

// Initialize Whop SDK
// Note: This requires WHOP_API_KEY in environment variables
function getWhopClient() {
  if (!process.env.WHOP_API_KEY) {
    throw new Error("WHOP_API_KEY is not configured in environment variables");
  }

  return new Whop({
    apiKey: process.env.WHOP_API_KEY,
  });
}

// GET - List promo codes for a company
// Required permissions: promo_code:basic:read, access_pass:basic:read
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId query parameter is required" }, { status: 400 });
    }

    if (!process.env.WHOP_API_KEY) {
      return NextResponse.json(
        {
          error: "WHOP_API_KEY not configured",
          message: "Please set WHOP_API_KEY in your environment variables (.env.local)",
        },
        { status: 500 }
      );
    }

    const whop = getWhopClient();

    // List promo codes for the company
    try {
      const result = await whop.promoCodes.list({
        company_id: companyId,
      });

      return NextResponse.json({
        success: true,
        promoCodes: result.data || result,
        companyId,
        total: Array.isArray(result.data) ? result.data.length : 0,
      });
    } catch (sdkError: unknown) {
      // If SDK method fails, provide helpful error
      const errorMsg = sdkError instanceof Error ? sdkError.message : "Unknown SDK error";
      console.error("Whop SDK error:", errorMsg);

      // Check for common error types
      if (errorMsg.includes("401") || errorMsg.includes("Unauthorized")) {
        return NextResponse.json(
          {
            error: "Authentication failed",
            message: "Invalid API key or insufficient permissions",
            suggestion: "Check your WHOP_API_KEY and ensure it has promo_code:basic:read permission",
            companyId,
          },
          { status: 401 }
        );
      }

      if (errorMsg.includes("404") || errorMsg.includes("not found")) {
        return NextResponse.json(
          {
            error: "Company not found",
            message: `Company ID ${companyId} not found or you don't have access to it`,
            companyId,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: "SDK error",
          message: `Failed to list promo codes: ${errorMsg}`,
          suggestion: "Check your API key, company ID, and SDK version compatibility",
          companyId,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Error fetching promo codes:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: errorMessage,
        message: "Failed to fetch promo codes. Check your API key and company ID.",
      },
      { status: 500 }
    );
  }
}

// POST - Validate a promo code
// This endpoint validates if a promo code exists and is valid for a given plan
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { code: string; planId: string; companyId?: string };

    if (!body.code || !body.planId) {
      return NextResponse.json({ error: "code and planId are required in request body" }, { status: 400 });
    }

    if (!process.env.WHOP_API_KEY) {
      return NextResponse.json(
        {
          error: "WHOP_API_KEY not configured",
          message: "Please set WHOP_API_KEY in your environment variables (.env.local)",
        },
        { status: 500 }
      );
    }

    const whop = getWhopClient();

    try {
      // Validate promo code by listing and filtering
      // The @whop/sdk v0.0.13 retrieve() method takes an ID, not code+planId
      // So we'll list promo codes and find the matching one

      if (!body.companyId && !process.env.WHOP_COMPANY_ID) {
        return NextResponse.json(
          {
            error: "companyId required",
            message: "Either provide companyId in request body or set WHOP_COMPANY_ID in environment",
          },
          { status: 400 }
        );
      }

      const companyId = body.companyId || process.env.WHOP_COMPANY_ID || "";

      // List promo codes for the company
      const allCodes = await whop.promoCodes.list({
        company_id: companyId,
      });

      // Find the promo code by code and plan
      const codes = (allCodes.data as Array<{ code: string; plan_ids?: string[]; id?: string }>) || [];
      const found = codes.find(
        (pc) => pc.code.toLowerCase() === body.code.toLowerCase() && (pc.plan_ids?.includes(body.planId) || !pc.plan_ids || pc.plan_ids.length === 0)
      );

      if (!found) {
        return NextResponse.json({
          valid: false,
          error: "Promo code not found or not applicable to this plan",
          code: body.code,
          planId: body.planId,
        });
      }

      // Promo code found and valid
      return NextResponse.json({
        valid: true,
        promoCode: found,
        code: body.code,
        planId: body.planId,
      });
    } catch (sdkError: unknown) {
      // If promo code doesn't exist or is invalid
      const errorMsg = sdkError instanceof Error ? sdkError.message : "Unknown error";

      // Check if it's a "not found" error
      if (errorMsg.includes("not found") || errorMsg.includes("404") || errorMsg.includes("Invalid")) {
        return NextResponse.json({
          valid: false,
          error: "Promo code not found or invalid",
          code: body.code,
          planId: body.planId,
        });
      }

      // Other SDK errors
      console.error("Whop SDK validation error:", errorMsg);
      return NextResponse.json(
        {
          valid: false,
          error: "Failed to validate promo code",
          message: `SDK error: ${errorMsg}`,
          suggestion: "Check Whop SDK documentation for the correct method signature.",
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Error validating promo code:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        valid: false,
        error: errorMessage,
        message: "Failed to validate promo code. Check your API key and request parameters.",
      },
      { status: 500 }
    );
  }
}
