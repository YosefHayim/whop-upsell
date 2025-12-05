import Whop from "@whop/sdk";
import { headers } from "next/headers";

// Initialize Whop SDK for server-side operations
export const whopsdk = new Whop({
  appID: process.env.WHOP_APP_ID || "",
  apiKey: process.env.WHOP_API_KEY || "",
});

// Helper function to verify user token and get user ID
export async function verifyUserToken() {
  const headersList = await headers();
  const { userId } = await whopsdk.verifyUserToken(headersList);
  return { userId };
}

// Helper function to check access to an experience
export async function checkExperienceAccess(experienceId: string, userId: string) {
  const access = await whopsdk.users.checkAccess(experienceId, { id: userId });
  return access;
}

// Helper function to check access to a company (for dashboard)
export async function checkCompanyAccess(companyId: string, userId: string) {
  const access = await whopsdk.users.checkAccess(companyId, { id: userId });
  return access;
}

