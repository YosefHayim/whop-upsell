import { NextRequest, NextResponse } from "next/server";
import Whop from "@whop/sdk";

// Initialize Whop SDK
// Note: You may need to provide appID if required by your Whop app configuration
const whop = new Whop({
  appID: process.env.WHOP_APP_ID || "", // Optional: Required if your app needs it
  apiKey: process.env.WHOP_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, planId, promoCode } = body;

    // Either productId or planId is required
    if (!productId && !planId) {
      return NextResponse.json(
        { error: "Product ID or Plan ID is required" },
        { status: 400 }
      );
    }

    // Use provided promo code or default to SAVE10
    const codeToUse = promoCode || process.env.DEFAULT_PROMO_CODE || "SAVE10";

    if (!process.env.WHOP_API_KEY) {
      console.error("WHOP_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "Server configuration error: API key not found" },
        { status: 500 }
      );
    }

    // Construct checkout URL with promo code
    // Whop checkout URLs follow the format: https://whop.com/checkout/{plan_id}?promo_code={code}
    // Note: You typically need a plan_id (plan_xxx) for checkout, not a product_id (prod_xxx)
    // If you have a productId, you may need to fetch the plan ID first, or use planId directly
    const checkoutId = planId || productId;
    
    // Construct the checkout URL with promo code as query parameter
    const checkoutUrl = `https://whop.com/checkout/${checkoutId}?promo_code=${encodeURIComponent(codeToUse)}`;

    // Optional: Verify the promo code exists using the SDK
    // This helps ensure the promo code is valid before redirecting
    try {
      // If you have a planId, you can verify the promo code
      if (planId) {
        // Note: This requires the planId to be in the correct format (plan_xxx)
        // Uncomment if you want to verify the promo code before redirecting
        // const promoCodeInfo = await whop.promoCodes.getPromoCode({
        //   code: codeToUse,
        //   planId: planId,
        // });
      }
    } catch (verifyError) {
      // Log but don't fail - the promo code might still work at checkout
      console.warn("Could not verify promo code:", verifyError);
    }

    return NextResponse.json({
      success: true,
      checkoutUrl,
      promoCode: codeToUse,
      planId: checkoutId,
    });
  } catch (error: unknown) {
    console.error("Error in claim-discount route:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

