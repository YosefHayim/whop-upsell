import Whop from "@whop/sdk";
import { headers } from "next/headers";

// Lazy initialization of Whop SDK to ensure env vars are loaded
let whopsdkInstance: Whop | null = null;

function getWhopSDK(): Whop {
  if (!whopsdkInstance) {
    const appID = process.env.WHOP_APP_ID;
    const apiKey = process.env.WHOP_API_KEY;

    if (!appID) {
      throw new Error(
        "WHOP_APP_ID is not set in environment variables. Please add WHOP_APP_ID to your .env.local file."
      );
    }

    if (!apiKey) {
      throw new Error(
        "WHOP_API_KEY is not set in environment variables. Please add WHOP_API_KEY to your .env.local file."
      );
    }

    whopsdkInstance = new Whop({
      appID,
      apiKey,
    });
  }

  return whopsdkInstance;
}

// Export a getter function for the SDK instance
export function whopsdk(): Whop {
  return getWhopSDK();
}

// Helper function to verify user token and get user ID
export async function verifyUserToken() {
  const headersList = await headers();
  const sdk = getWhopSDK();
  const { userId } = await sdk.verifyUserToken(headersList);
  return { userId };
}

// Helper function to check access to an experience
export async function checkExperienceAccess(experienceId: string, userId: string) {
  const sdk = getWhopSDK();
  const access = await sdk.users.checkAccess(experienceId, { id: userId });
  return access;
}

// Helper function to check access to a company (for dashboard)
export async function checkCompanyAccess(companyId: string, userId: string) {
  const sdk = getWhopSDK();
  const access = await sdk.users.checkAccess(companyId, { id: userId });
  return access;
}
