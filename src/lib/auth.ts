import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

function getOAuthRedirectUrl(): string {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredSiteUrl) {
    return `${configuredSiteUrl.replace(/\/$/, "")}/auth/callback`;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback`;
  }

  return "";
}

/**
 * Check if a user email is in the allowlist
 */
export async function isEmailAllowed(email: string): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const normalized = email.toLowerCase();
    const { data, error } = await supabase
      .from("allowed_users")
      .select("email")
      .eq("email", normalized)
      .maybeSingle();

    if (error) {
      console.error("Error checking allowlist:", error.message);
      return false;
    }

    return typeof data?.email === "string" && data.email.toLowerCase() === normalized;
  } catch (err) {
    console.error("Error checking allowlist:", err);
    return false;
  }
}

/**
 * Check if a user is an admin
 */
export async function isUserAdmin(email: string): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from("allowed_users")
      .select("is_admin")
      .eq("email", email.toLowerCase())
      .single();

    if (error) {
      console.error("Error checking admin status:", error.message);
      return false;
    }

    return data?.is_admin === true;
  } catch (err) {
    console.error("Error checking admin status:", err);
    return false;
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const redirectTo = getOAuthRedirectUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  if (!supabase) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/**
 * Check if current user is authenticated and allowed
 */
export async function isUserAuthenticated(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  const user = session.user;
  if (!user?.email) return false;

  return isEmailAllowed(user.email);
}
