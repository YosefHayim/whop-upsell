import { checkExperienceAccess, verifyUserToken } from "@/lib/whop-sdk";

import DownsellExperience from "./DownsellExperience";
import { headers } from "next/headers";

export default async function ExperiencePage({ params }: { params: Promise<{ experienceId: string }> }) {
  const { experienceId } = await params;

  try {
    // Verify user token
    const { userId } = await verifyUserToken();

    // Check if user has access to this experience
    const access = await checkExperienceAccess(experienceId, userId);

    if (!access.has_access) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-400">You don't have access to this experience.</p>
          </div>
        </div>
      );
    }

    // Get experience details to extract company/product info
    // The experience ID can be used to get associated products/plans
    // For now, we'll pass the experienceId and let the component handle it

    // access.access_level can be "customer", "admin", or "no_access"
    const accessLevel = access.access_level === "admin" ? "admin" : "customer";

    return <DownsellExperience experienceId={experienceId} userId={userId} accessLevel={accessLevel} />;
  } catch (error) {
    console.error("Error in ExperiencePage:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400">{error instanceof Error ? error.message : "An error occurred"}</p>
        </div>
      </div>
    );
  }
}
