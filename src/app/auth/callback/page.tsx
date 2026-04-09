"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/auth";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      if (!supabase) {
        console.error("Supabase not configured");
        router.push("/login");
        return;
      }

      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(url.hash.startsWith("#") ? url.hash.slice(1) : "");

      const providerError =
        url.searchParams.get("error_description") ||
        url.searchParams.get("error") ||
        hashParams.get("error_description") ||
        hashParams.get("error");

      if (providerError) {
        console.error("OAuth provider error:", providerError);
        router.push(`/login?error=${encodeURIComponent(providerError)}`);
        return;
      }

      const code = url.searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("Code exchange error:", exchangeError.message);
          router.push(`/login?error=${encodeURIComponent(exchangeError.message)}`);
          return;
        }
      }

      // Get the session after OAuth callback
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.error("Auth error:", error);
        router.push("/login?error=auth_failed");
        return;
      }

      // Redirect to dashboard
      router.push("/dashboard");
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Signing you in...</h1>
        <p className="text-gray-400">Please wait while we authenticate you.</p>
      </div>
    </div>
  );
}
