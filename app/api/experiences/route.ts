import { NextRequest, NextResponse } from "next/server";
import { verifyUserToken, whopsdk } from "@/lib/whop-sdk";

// GET - Helper endpoint for local development to find experience IDs
// This endpoint provides instructions on how to get experience IDs
export async function GET(request: NextRequest) {
  try {
    // Verify user token to ensure proxy is working
    const { userId } = await verifyUserToken();

    const sdk = whopsdk();
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("companyId");

    // Try to list experiences if we have a company ID
    if (companyId) {
      try {
        // Try the Whop SDK listExperiences method
        // According to Whop SDK docs: listExperiences returns experiencesV2.nodes
        const experiencesApi = sdk.experiences as {
          listExperiences?: (params: { companyId: string; first?: number }) => Promise<{
            experiencesV2?: { nodes?: Array<{ id: string; name?: string; experience_type?: string }> };
          }>;
          list?: (params?: { companyId?: string }) => Promise<unknown[]>;
          listAll?: () => Promise<unknown[]>;
        };

        let experiences: Array<{ id: string; name?: string; experience_type?: string }> = [];

        // Try listExperiences first (most likely method based on docs)
        if (typeof experiencesApi.listExperiences === "function") {
          const result = await experiencesApi.listExperiences({
            companyId,
            first: 50,
          });
          experiences = (result?.experiencesV2?.nodes || []) as Array<{ id: string; name?: string; experience_type?: string }>;
        }
        // Fallback: Try list method
        else if (typeof experiencesApi.list === "function") {
          const result = await experiencesApi.list({ companyId });
          experiences = (Array.isArray(result) ? result : []) as Array<{ id: string; name?: string; experience_type?: string }>;
        }
        // Fallback: Try listAll
        else if (typeof experiencesApi.listAll === "function") {
          const result = await experiencesApi.listAll();
          experiences = (Array.isArray(result) ? result : []) as Array<{ id: string; name?: string; experience_type?: string }>;
        }

        if (experiences.length > 0) {
          // Format the response for easy reading
          const formattedExperiences = experiences.map((exp) => ({
            id: exp.id,
            name: exp.name || "Unnamed Experience",
            type: exp.experience_type || "unknown",
            companyId: companyId,
            url: `/experiences/${exp.id}`,
            localUrl: `http://localhost:3000/experiences/${exp.id}`,
          }));

          return NextResponse.json({
            success: true,
            count: formattedExperiences.length,
            experiences: formattedExperiences,
            message: "Use the 'id' field in the URL: /experiences/[id]",
          });
        } else {
          return NextResponse.json({
            success: true,
            count: 0,
            experiences: [],
            message: "No experiences found for this company. Create an experience in your Whop dashboard first.",
            companyId,
            help: "To create an experience: 1. Go to https://whop.com/dashboard 2. Navigate to Experiences 3. Create a new experience",
          });
        }
      } catch (error) {
        console.error("Error listing experiences:", error);
        // Return error but continue to show instructions
        return NextResponse.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            message: "Could not list experiences. See instructions below for alternative methods.",
            companyId,
            instructions: [
              "1. Make sure the company ID is correct (format: biz_xxxxxxxxxxxxxx)",
              "2. Ensure your API key has 'experience:read' permissions",
              "3. Try creating an experience in your Whop dashboard first",
              "4. Or use the API directly: GET https://api.whop.com/api/v2/experiences with Authorization: Bearer YOUR_API_KEY",
            ],
          },
          { status: 500 }
        );
      }
    }

    // Fallback: Provide instructions on how to get experience IDs
    return NextResponse.json({
      success: true,
      message: "How to get an Experience ID",
      instructions: [
        {
          method: "From Whop Dashboard",
          steps: [
            "1. Go to https://whop.com/dashboard",
            "2. Navigate to the 'Experiences' section",
            "3. Create or select an experience that uses your app",
            "4. Copy the Experience ID (it looks like: exp_xxxxxxxxxxxxxx)",
            "5. Use it in your local URL: http://localhost:3000/experiences/[id]",
          ],
        },
        {
          method: "From Experience URL",
          steps: [
            "1. Access an experience in Whop",
            "2. Look at the URL: https://whop.com/experiences/exp_xxxxxxxxxxxxxx",
            "3. Copy the part after '/experiences/' (the exp_xxxxxxxxxxxxxx)",
            "4. Use it in your local URL: http://localhost:3000/experiences/[id]",
          ],
        },
        {
          method: "Using API Endpoint with Company ID",
          steps: [
            "1. Get your company ID from Whop dashboard (biz_xxxxxxxxxxxxxx)",
            "2. Visit: http://localhost:3000/api/experiences?companyId=biz_xxxxxxxxxxxxxx",
            "3. This will list all experiences for that company using the Whop SDK",
          ],
        },
        {
          method: "Using Whop API Directly",
          steps: [
            "1. Get your API key from https://whop.com/developer",
            "2. Make a GET request to: https://api.whop.com/api/v2/experiences",
            "3. Include header: Authorization: Bearer YOUR_API_KEY",
            "4. Extract the 'id' field from each experience in the response",
          ],
        },
      ],
      userId,
      note: "Experience IDs are typically in the format: exp_xxxxxxxxxxxxxx",
    });
  } catch (error) {
    console.error("Error in experiences endpoint:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Make sure you're running through the Whop proxy (pnpm dev) and have valid WHOP_API_KEY and WHOP_APP_ID set.",
        instructions: [
          "1. Ensure you're running: pnpm dev (not just 'next dev')",
          "2. Check that WHOP_API_KEY and WHOP_APP_ID are set in .env.local",
          "3. Visit http://localhost:3000/api/experiences to see this message",
        ],
      },
      { status: 500 }
    );
  }
}
