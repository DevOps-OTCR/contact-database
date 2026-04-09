"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Contact } from "@/lib/types";
import Dashboard from "./Dashboard";
import { supabase, isEmailAllowed, isUserAdmin, signOut } from "@/lib/auth";

function deriveContactType(isOTCR: boolean, isUIUC: boolean): Contact["contactType"] {
  if (isOTCR && isUIUC) return "OTCR & UIUC";
  if (isOTCR) return "OTCR Only";
  if (isUIUC) return "UIUC Only";
  return "Other";
}

function parseYesNo(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "yes";
  }
  return false;
}

export default function DashboardGate() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  const companies = Array.from(new Set(contacts.map((c) => c.company).filter(Boolean))).sort();
  const industries = Array.from(
    new Set(
      contacts
        .map((c) => c.industry)
        .filter((value): value is string => Boolean(value && value.trim()))
    )
  ).sort();

  useEffect(() => {
    const loadContacts = async () => {
      if (!supabase || !authenticated) {
        return;
      }

      setContactsLoading(true);

      try {
        const pageSize = 1000;
        let from = 0;
        const rows: Array<Record<string, unknown>> = [];
        let hasMore = true;

        while (hasMore) {
          const to = from + pageSize - 1;
          const { data, error } = await supabase.from("contacts").select("*").range(from, to);

          if (error) {
            console.error("Error loading contacts:", error.message);
            break;
          }

          if (!data || data.length === 0) {
            break;
          }

          rows.push(...(data as Array<Record<string, unknown>>));

          if (data.length < pageSize) {
            hasMore = false;
          } else {
            from += pageSize;
          }
        }

        const mappedContacts: Contact[] = rows.map((row, index) => {
          const firstName = typeof row.first_name === "string" ? row.first_name : "";
          const lastName = typeof row.last_name === "string" ? row.last_name : "";
          const fullName = `${firstName} ${lastName}`.trim() || "N/A";
          const isOTCR = parseYesNo(row.is_otcr_alum);
          const isUIUC = parseYesNo(row.is_uiuc_alum);

          return {
            id: index + 1,
            supabaseId: typeof row.id === "number" ? row.id : undefined,
            name: fullName,
            company: typeof row.company_name === "string" ? row.company_name : "",
            role: typeof row.role === "string" ? row.role : "",
            email: typeof row.email === "string" ? row.email : "",
            altEmail: typeof row.alt_email === "string" ? row.alt_email : "",
            linkedin:
              typeof row.linkedin === "string" && row.linkedin.trim()
                ? row.linkedin
                : undefined,
            isOTCR,
            isUIUC,
            contactType: deriveContactType(isOTCR, isUIUC),
            graduationYear:
              typeof row.graduation_year === "number" ? row.graduation_year : undefined,
            major: typeof row.major === "string" ? row.major : undefined,
            subMajor: typeof row.sub_major === "string" ? row.sub_major : undefined,
            industry: typeof row.industry === "string" ? row.industry : undefined,
          };
        });

        setContacts(mappedContacts);
      } finally {
        setContactsLoading(false);
      }
    };

    loadContacts();
  }, [authenticated]);

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        setChecked(true);
        router.push("/login");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        setChecked(true);
        router.push("/login");
        return;
      }

      const email = session.user.email;
      const allowed = await isEmailAllowed(email);
      if (!allowed) {
        setChecked(true);
        router.push("/access-denied");
        return;
      }

      // Check if user is admin to control edit access
      const admin = await isUserAdmin(email);

      setUserEmail(email);
      setAuthenticated(true);
      setIsAdmin(admin);
      setEditMode(false);
      setChecked(true);
    };

    checkAuth();
  }, [router]);

  // Handle Escape key to exit edit mode
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && editMode) {
        setEditMode(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [editMode]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!checked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted text-sm">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-card-border bg-card/60 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <svg className="h-4 w-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">OTCR Contact Database</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted bg-card border border-card-border rounded-md px-2.5 py-1">
              {contacts.length} contacts
            </span>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setEditMode((v) => !v)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  editMode
                    ? "bg-accent text-white border-accent"
                    : "bg-card text-muted border-card-border hover:text-foreground"
                }`}
              >
                {editMode ? "Done editing" : "Edit database"}
              </button>
            )}
            <div className="flex items-center gap-2 pl-3 border-l border-card-border">
              <span className="text-xs text-muted">{userEmail}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-[1800px] mx-auto px-6 py-6">
        {contactsLoading ? (
          <div className="text-muted text-sm">Loading contacts...</div>
        ) : (
          <Dashboard
            contacts={contacts}
            companies={companies}
            industries={industries}
            editMode={editMode}
          />
        )}
      </main>
    </div>
  );
}
