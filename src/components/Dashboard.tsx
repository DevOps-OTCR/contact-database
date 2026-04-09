"use client";

import { useState, useMemo } from "react";
import { Contact } from "@/lib/types";
import { supabase } from "@/lib/auth";
import SearchBar from "./SearchBar";
import FilterSidebar from "./FilterSidebar";
import ContactTable from "./ContactTable";
import { categorizeIndustry, getAlumniStatus } from "@/lib/filterHelpers";

export interface Filters {
  company: string[];
  industry: string[];
  alumniStatus: string[];
}

interface DashboardProps {
  contacts: Contact[];
  companies: string[];
  industries: string[];
  editMode: boolean;
}

function deriveContactType(isOTCR: boolean, isUIUC: boolean): Contact["contactType"] {
  if (isOTCR && isUIUC) return "OTCR & UIUC";
  if (isOTCR) return "OTCR Only";
  if (isUIUC) return "UIUC Only";
  return "Other";
}

function AddContactForm({
  onContactCreated,
}: {
  onContactCreated: (contact: Contact) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [isOTCRAlum, setIsOTCRAlum] = useState(false);
  const [isUIUCAlum, setIsUIUCAlum] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    
    const confirmed = window.confirm(
      "Are you sure you want to add this contact?"
    );
    if (!confirmed) return;
    
    setSubmitting(true);
    try {
      if (!supabase) {
        alert("Supabase is not configured.");
        setSubmitting(false);
        return;
      }

      const { data, error } = await supabase
        .from("contacts")
        .insert({
          first_name: firstName,
          last_name: lastName,
          company_name: companyName,
          industry: industry || null,
          email,
          linkedin: linkedin || null,
          is_otcr_alum: isOTCRAlum ? "Yes" : "No",
          is_uiuc_alum: isUIUCAlum ? "Yes" : "No",
        })
        .select("*")
        .single();

      if (error) {
        console.error("Failed to create contact", error.message);
        alert("Failed to create contact. Check console for details.");
        setSubmitting(false);
        return;
      }

      const createdContact: Contact = {
        id: Date.now(),
        supabaseId: typeof data?.id === "number" ? data.id : undefined,
        name: `${firstName} ${lastName}`.trim() || "N/A",
        company: companyName,
        role: data?.role ?? "",
        email,
        altEmail: data?.alt_email ?? "",
        linkedin: linkedin || undefined,
        isOTCR: isOTCRAlum,
        isUIUC: isUIUCAlum,
        contactType: deriveContactType(isOTCRAlum, isUIUCAlum),
        graduationYear: data?.graduation_year ?? undefined,
        major: data?.major ?? undefined,
        subMajor: data?.sub_major ?? undefined,
        industry: industry || undefined,
      };

      onContactCreated(createdContact);

      // Clear form and reload to show new contact
      setFirstName("");
      setLastName("");
      setCompanyName("");
      setIndustry("");
      setEmail("");
      setLinkedin("");
      setIsOTCRAlum(false);
      setIsUIUCAlum(false);

      setSubmitting(false);
    } catch (err) {
      console.error("Error creating contact", err);
      alert("Error creating contact. Check console for details.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-card-border rounded-lg px-4 py-3 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs"
    >
      <div className="flex flex-col gap-1">
        <label className="font-medium text-muted uppercase tracking-wide">First Name</label>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="px-2 py-1.5 rounded-md border border-card-border bg-background text-foreground text-xs"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-medium text-muted uppercase tracking-wide">Last Name</label>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="px-2 py-1.5 rounded-md border border-card-border bg-background text-foreground text-xs"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-medium text-muted uppercase tracking-wide">Company</label>
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          className="px-2 py-1.5 rounded-md border border-card-border bg-background text-foreground text-xs"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-medium text-muted uppercase tracking-wide">Industry</label>
        <input
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="px-2 py-1.5 rounded-md border border-card-border bg-background text-foreground text-xs"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-medium text-muted uppercase tracking-wide">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-2 py-1.5 rounded-md border border-card-border bg-background text-foreground text-xs"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-medium text-muted uppercase tracking-wide">LinkedIn URL</label>
        <input
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          placeholder="https://linkedin.com/in/..."
          className="px-2 py-1.5 rounded-md border border-card-border bg-background text-foreground text-xs"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center gap-1 text-xs text-muted">
          <input
            type="checkbox"
            checked={isOTCRAlum}
            onChange={(e) => setIsOTCRAlum(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-card-border text-accent accent-accent"
          />
          OTCR Alum
        </label>
        <label className="inline-flex items-center gap-1 text-xs text-muted">
          <input
            type="checkbox"
            checked={isUIUCAlum}
            onChange={(e) => setIsUIUCAlum(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-card-border text-accent accent-accent"
          />
          UIUC Alum
        </label>
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Add Contact"}
        </button>
      </div>
    </form>
  );
}
export default function Dashboard({ contacts, companies, industries, editMode }: DashboardProps) {
  const [allContacts, setAllContacts] = useState<Contact[]>(contacts);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>({
    company: [],
    industry: [],
    alumniStatus: [],
  });

  const dynamicCompanies = useMemo(() => {
    const values = new Set(allContacts.map((c) => c.company).filter(Boolean));
    return Array.from(values).sort();
  }, [allContacts]);

  const dynamicIndustries = useMemo(() => {
    const values = new Set(
      allContacts
        .map((c) => c.industry)
        .filter((v): v is string => Boolean(v && String(v).trim()))
    );
    return Array.from(values).sort();
  }, [allContacts]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return allContacts.filter((contact) => {
      // Text search across all fields
      if (query) {
        const searchable = [
          contact.name,
          contact.company,
          contact.role,
          contact.email,
          contact.altEmail,
          contact.contactType,
          contact.major,
          contact.subMajor,
          contact.industry,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(query)) return false;
      }

      // Company filter (OR: match any selected company)
      if (filters.company.length > 0) {
        if (!contact.company || !filters.company.includes(contact.company)) {
          return false;
        }
      }

      // Industry filter
      if (filters.industry.length > 0) {
        const contactIndustryCategory = categorizeIndustry(contact.industry);
        if (!filters.industry.includes(contactIndustryCategory)) {
          return false;
        }
      }

      // Alumni Status filter
      if (filters.alumniStatus.length > 0) {
        const contactAlumniStatus = getAlumniStatus(contact);
        if (!filters.alumniStatus.includes(contactAlumniStatus)) {
          return false;
        }
      }

      return true;
    });
  }, [allContacts, search, filters]);

  const handleContactCreated = (contact: Contact) => {
    setAllContacts((prev) => [contact, ...prev]);
  };

  const handleContactUpdated = (contact: Contact) => {
    setAllContacts((prev) =>
      prev.map((c) => (c.supabaseId === contact.supabaseId ? contact : c))
    );
  };

  const handleContactDeleted = (supabaseId: number) => {
    setAllContacts((prev) => prev.filter((c) => c.supabaseId !== supabaseId));
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Sidebar */}
      <FilterSidebar
        filters={filters}
        onChange={setFilters}
        companies={dynamicCompanies.length > 0 ? dynamicCompanies : companies}
        industries={dynamicIndustries.length > 0 ? dynamicIndustries : industries}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="mb-6 flex flex-col gap-4">
          {editMode && <AddContactForm onContactCreated={handleContactCreated} />}
          <SearchBar
            value={search}
            onChange={setSearch}
            resultCount={filtered.length}
            totalCount={allContacts.length}
          />
        </div>
        <div className="flex-1 overflow-auto">
          <ContactTable
            contacts={filtered}
            editMode={editMode}
            onContactUpdated={handleContactUpdated}
            onContactDeleted={handleContactDeleted}
          />
        </div>
      </div>
    </div>
  );
}
