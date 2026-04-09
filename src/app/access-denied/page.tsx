"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

export default function AccessDeniedPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h2.586a1 1 0 00.707-.293l2.414-2.414a1 1 0 00-1.414-1.414L17.586 3H15a2 2 0 00-2 2v2m0 0H9a2 2 0 00-2 2v2m0 0v6a2 2 0 002 2h6a2 2 0 002-2v-6m0 0V9a2 2 0 002-2v-2a2 2 0 00-2-2h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 001.414 1.414L6.414 3H9a2 2 0 012 2z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-6">
          Your email is not authorized to access the OTCR Contact Database.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          If you believe this is a mistake, please contact the database administrator.
        </p>
        <button
          onClick={handleSignOut}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
