import { NextRequest, NextResponse } from "next/server";

interface ClaimDiscountRequestBody {
  productId?: string;
  planId?: string;
  promoCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ClaimDiscountRequestBody;
    const { productId, planId, promoCode } = body;

    // Either productId or planId is required
    if (!productId && !planId) {
      return NextResponse.json({ error: "Product ID or Plan ID is required" }, { status: 400 });
    }

    // Use provided promo code or default to SAVE10
    const codeToUse = promoCode || process.env.DEFAULT_PROMO_CODE || "SAVE10";

    if (!process.env.WHOP_API_KEY) {
      console.error("WHOP_API_KEY is not set in environment variables");
      return NextResponse.json({ error: "Server configuration error: API key not found" }, { status: 500 });
    }

    // Construct checkout URL with promo code
    // Whop checkout URLs follow the format: https://whop.com/checkout/{plan_id}?promo_code={code}
    // Note: You typically need a plan_id (plan_xxx) for checkout, not a product_id (prod_xxx)
    // If you have a productId, you may need to fetch the plan ID first, or use planId directly
    const checkoutId = planId || productId;

    // TypeScript guard: This should never happen due to validation above, but ensures type safety
    if (!checkoutId) {
      return NextResponse.json({ error: "Invalid checkout ID" }, { status: 400 });
    }

    // Construct the checkout URL with promo code as query parameter
    // Whop checkout URLs follow the format: https://whop.com/checkout/{plan_id}?promo_code={code}
    const checkoutUrl = `https://whop.com/checkout/${checkoutId}?promo_code=${encodeURIComponent(codeToUse)}`;

    // Note: Promo code verification can be added here using the Whop SDK if needed
    // Example: const whop = new Whop({ apiKey: process.env.WHOP_API_KEY });
    // const promoCodeInfo = await whop.promoCodes.getPromoCode({ code: codeToUse, planId });

    interface ClaimDiscountResponse {
      success: boolean;
      checkoutUrl: string;
      promoCode: string;
      planId: string;
    }

    const response: ClaimDiscountResponse = {
      success: true,
      checkoutUrl,
      promoCode: codeToUse,
      planId: checkoutId,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error in claim-discount route:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
