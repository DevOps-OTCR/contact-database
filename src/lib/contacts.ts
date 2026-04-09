import { createClient } from "@supabase/supabase-js";
import { Contact } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Lightweight in-memory cache for server renders to avoid hitting Supabase on every request.
const CONTACTS_CACHE_TTL_MS = 60 * 1000;
let contactsCache: Contact[] | null = null;
let contactsCacheAt = 0;
let inFlightContactsLoad: Promise<Contact[]> | null = null;

type SupabaseContactRow = Record<string, unknown>;

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function deriveContactType(otcr: boolean, uiuc: boolean): Contact["contactType"] {
  if (otcr && uiuc) return "OTCR & UIUC";
  if (otcr) return "OTCR Only";
  if (uiuc) return "UIUC Only";
  return "Other";
}

async function loadContactsFromSupabase(): Promise<Contact[]> {
  if (!SUPABASE_URL) {
    return [];
  }

  // Use SERVICE_ROLE_KEY for server-side queries to bypass RLS
  // Fall back to ANON_KEY if SERVICE_ROLE_KEY is not available
  const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  if (!key) {
    return [];
  }

  const supabase = createClient(SUPABASE_URL, key);

  try {
    const pageSize = 1000;
    let from = 0;
    const allRows: SupabaseContactRow[] = [];
    let hasMore = true;

    // Page through Supabase results in chunks of 1000 until we have everything.
    // This avoids the default 1000-row limit.
    while (hasMore) {
      const to = from + pageSize - 1;
      const { data: rows, error } = await supabase
        .from("contacts")
        .select("*")
        .range(from, to);

      if (error) {
        console.error("Error fetching contacts from Supabase:", error.message);
        break;
      }

      if (!rows || rows.length === 0) {
        break;
      }

      allRows.push(...(rows as SupabaseContactRow[]));

      if (rows.length < pageSize) {
        hasMore = false;
      } else {
        from += pageSize;
      }
    }

    console.log(`Supabase contacts: loaded ${allRows.length} rows`);

    const contacts: Contact[] = allRows.map((row, index) => {
      const firstName = readString(row.first_name ?? row.firstName);
      const lastName = readString(row.last_name ?? row.lastName);
      const existingName = readOptionalString(row.name);
      let name: string =
        existingName
          ? existingName
          : `${firstName} ${lastName}`.trim();

      // If we still don't have a name, mark as N/A so we can display it
      // and handle sorting specially on the frontend.
      if (!name) {
        name = "N/A";
      }

      const otcrRaw =
        row.is_otcr_alum ?? row.is_otcr ?? row.otcr ?? row.isOTCR;
      const uiucRaw =
        row.is_uiuc_alum ?? row.is_uiuc ?? row.uiuc ?? row.isUIUC;

      const otcr =
        typeof otcrRaw === "string"
          ? otcrRaw.trim().toLowerCase() === "yes"
          : Boolean(otcrRaw);
      const uiuc =
        typeof uiucRaw === "string"
          ? uiucRaw.trim().toLowerCase() === "yes"
          : Boolean(uiucRaw);

      const rawGraduationYear =
        row.graduation_year ?? row.graduationYear ?? undefined;
      const graduationYear =
        typeof rawGraduationYear === "number"
          ? rawGraduationYear
          : rawGraduationYear
          ? parseInt(String(rawGraduationYear), 10)
          : undefined;

      return {
        id: index + 1,
        supabaseId: typeof row.id === "number" ? row.id : undefined,
        name,
        company: readString(row.company_name ?? row.company),
        role: readString(row.role),
        email: readString(row.email),
        altEmail: readString(row.alt_email ?? row.altEmail),
        linkedin: readOptionalString(row.linkedin),
        isOTCR: otcr,
        isUIUC: uiuc,
        contactType: deriveContactType(otcr, uiuc),
        graduationYear:
          graduationYear && !isNaN(graduationYear) ? graduationYear : undefined,
        major: readOptionalString(row.major),
        subMajor: readOptionalString(row.sub_major ?? row.subMajor),
        industry: readOptionalString(row.industry),
      };
    });

    return contacts;
  } catch (err) {
    console.error("Error loading contacts from Supabase:", err);
    return [];
  }
}

export async function loadContacts(): Promise<Contact[]> {
  // Only use Supabase for contacts now. If Supabase is not configured or returns
  // nothing, we return an empty list instead of falling back to the CSV.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Supabase env vars missing: SUPABASE_URL and/or SUPABASE_ANON_KEY");
    return [];
  }

  const now = Date.now();
  if (contactsCache && now - contactsCacheAt < CONTACTS_CACHE_TTL_MS) {
    return contactsCache;
  }

  if (inFlightContactsLoad) {
    return inFlightContactsLoad;
  }

  inFlightContactsLoad = loadContactsFromSupabase()
    .then((contacts) => {
      contactsCache = contacts;
      contactsCacheAt = Date.now();
      return contacts;
    })
    .finally(() => {
      inFlightContactsLoad = null;
    });

  return inFlightContactsLoad;
}

export function clearContactsCache() {
  contactsCache = null;
  contactsCacheAt = 0;
}

export function getUniqueValues(contacts: Contact[], key: keyof Contact): string[] {
  const values = new Set(
    contacts.map((c) => String(c[key])).filter((v) => v && v !== "false" && v !== "true")
  );
  return Array.from(values).sort();
}
