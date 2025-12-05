import { headers } from "next/headers";
import { whopsdk, verifyUserToken, checkCompanyAccess } from "@/lib/whop-sdk";
import DashboardAdmin from "./DashboardAdmin";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;

  try {
    // Verify user token
    const { userId } = await verifyUserToken();

    // Check if user has admin access to this company
    const access = await checkCompanyAccess(companyId, userId);

    if (access.access_level !== "admin") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Admin Access Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You must be an admin of this company to access the dashboard.
            </p>
          </div>
        </div>
      );
    }

    return <DashboardAdmin companyId={companyId} userId={userId} />;
  } catch (error) {
    console.error("Error in DashboardPage:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }
}

