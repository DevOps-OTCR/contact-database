"use client";

import { useState, useCallback, useEffect } from "react";
import { Contact } from "@/lib/types";
import { supabase } from "@/lib/auth";

function CopyEmail({ email, className }: { email: string; className: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [email]);

  return (
    <button onClick={handleCopy} className={`${className} cursor-pointer text-left`} title={email}>
      {copied ? (
        <span className="text-emerald-400">Copied!</span>
      ) : (
        email
      )}
    </button>
  );
}

interface ContactTableProps {
  contacts: Contact[];
  editMode: boolean;
  onContactUpdated: (contact: Contact) => void;
  onContactDeleted: (supabaseId: number) => void;
}

type SortKey = "name" | "company" | "industry" | "contactType";
type SortDir = "asc" | "desc";

const TYPE_STYLES: Record<string, string> = {
  "OTCR & UIUC": "bg-[#0d2340] text-[#3a96e5]",
  "OTCR Only":   "bg-[#111a24] text-[#5a7090]",
  "UIUC Only":   "bg-[#0d2340] text-[#6aaee8]",
  "Other":       "bg-[#111a24] text-[#5a7090]",
};

export default function ContactTable({
  contacts,
  editMode,
  onContactUpdated,
  onContactDeleted,
}: ContactTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    industry: "",
    email: "",
    linkedin: "",
    isOTCRAlum: false,
    isUIUCAlum: false,
  });

  function deriveContactType(isOTCR: boolean, isUIUC: boolean): Contact["contactType"] {
    if (isOTCR && isUIUC) return "OTCR & UIUC";
    if (isOTCR) return "OTCR Only";
    if (isUIUC) return "UIUC Only";
    return "Other";
  }

  const sorted = [...contacts].sort((a, b) => {
    // Special handling for name: contacts with missing/placeholder names ("N/A")
    // should always appear at the bottom, regardless of sort direction.
    if (sortKey === "name") {
      const aMissing = !a.name || a.name === "N/A";
      const bMissing = !b.name || b.name === "N/A";
      if (aMissing !== bMissing) {
        // aMissing true => a goes after b
        return aMissing ? 1 : -1;
      }
    }

    const aVal = String(a[sortKey] ?? "").toLowerCase();
    const bVal = String(b[sortKey] ?? "").toLowerCase();
    return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  // Handle Escape key to close edit modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && editingContact) {
        e.stopImmediatePropagation(); // Prevent other Escape handlers from firing
        setEditingContact(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [editingContact]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function renderSortHeader(label: string, field: SortKey) {
    const isActive = sortKey === field;
    return (
      <th
        key={field}
        onClick={() => handleSort(field)}
        className="px-3 py-2 text-left text-[11px] font-medium text-muted uppercase tracking-[0.08em] cursor-pointer hover:text-foreground select-none transition-colors whitespace-nowrap"
      >
        <span className="flex items-center gap-1">
          {label}
          {isActive && (
            <svg className="h-3 w-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sortDir === "asc" ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              )}
            </svg>
          )}
        </span>
      </th>
    );
  }

  function handleEdit(contact: Contact) {
    const names = contact.name ? contact.name.trim().split(/\s+/) : [];
    const firstName = names[0] || "";
    const lastName = names.slice(1).join(" ") || "";
    setEditForm({
      firstName,
      lastName,
      companyName: contact.company || "",
      industry: contact.industry || "",
      email: contact.email || "",
      linkedin: contact.linkedin || "",
      isOTCRAlum: contact.isOTCR || false,
      isUIUCAlum: contact.isUIUC || false,
    });
    setEditingContact(contact);
  }

  async function handleUpdate() {
    if (!editingContact || typeof editingContact.supabaseId !== "number") return;

    const confirmed = window.confirm(
      "Are you sure you want to update this contact?"
    );
    if (!confirmed) return;

    try {
      if (!supabase) {
        alert("Supabase is not configured.");
        return;
      }

      const { error } = await supabase
        .from("contacts")
        .update({
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          company_name: editForm.companyName,
          industry: editForm.industry || null,
          email: editForm.email,
          linkedin: editForm.linkedin || null,
          is_otcr_alum: editForm.isOTCRAlum ? "Yes" : "No",
          is_uiuc_alum: editForm.isUIUCAlum ? "Yes" : "No",
        })
        .eq("id", editingContact.supabaseId);

      if (error) {
        console.error("Failed to update contact", error.message);
        alert("Failed to update contact. See console for details.");
        return;
      }

      const updatedContact: Contact = {
        ...editingContact,
        name: `${editForm.firstName} ${editForm.lastName}`.trim() || "N/A",
        company: editForm.companyName,
        industry: editForm.industry || undefined,
        email: editForm.email,
        linkedin: editForm.linkedin || undefined,
        isOTCR: editForm.isOTCRAlum,
        isUIUC: editForm.isUIUCAlum,
        contactType: deriveContactType(editForm.isOTCRAlum, editForm.isUIUCAlum),
      };

      onContactUpdated(updatedContact);

      setEditingContact(null);
    } catch (err) {
      console.error("Error updating contact", err);
      alert("Error updating contact. See console for details.");
    }
  }

  async function handleDelete(contactId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact? This is not reversible."
    );
    if (!confirmed) return;

    try {
      if (!supabase) {
        alert("Supabase is not configured.");
        return;
      }

      const { error } = await supabase.from("contacts").delete().eq("id", contactId);
      if (error) {
        console.error("Failed to delete contact", error.message);
        alert("Failed to delete contact. See console for details.");
        return;
      }

      onContactDeleted(contactId);
    } catch (err) {
      console.error("Error deleting contact", err);
      alert("Error deleting contact. See console for details.");
    }
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-card border border-card-border mb-4">
          <svg className="h-5 w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground">No contacts found</p>
        <p className="mt-1 text-xs text-muted">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="border border-card-border h-full flex flex-col" style={{ background: "rgba(7, 18, 32, 0.9)" }}>
      <div className="relative flex-1 overflow-auto">
        <table className="min-w-full table-auto">
          <thead className="sticky top-0 z-10" style={{ background: "#071220" }}>
            <tr className="border-b border-card-border">
              {renderSortHeader("Name", "name")}
              {renderSortHeader("Company", "company")}
              {renderSortHeader("Industry", "industry")}
              {renderSortHeader("Type", "contactType")}
              <th className="px-3 py-2 text-left text-[11px] font-medium text-muted uppercase tracking-[0.08em] w-[220px] max-w-[220px]">
                Email
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-medium text-muted uppercase tracking-[0.08em]">
                LinkedIn
              </th>
              {editMode && (
                <th className="px-3 py-2 text-left text-[11px] font-medium text-muted uppercase tracking-[0.08em] w-[100px]">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((contact, i) => (
              <tr
                key={contact.id}
                className={`border-b border-card-border transition-colors group ${i === sorted.length - 1 ? "border-b-0" : ""}`}
              >
                <td className="data-primary px-3 py-2 text-[13px] whitespace-nowrap border-l-2 border-l-transparent group-hover:border-l-accent transition-colors">
                  {contact.name}
                </td>
                <td className="data-secondary px-3 py-2 text-[13px] max-w-[160px] truncate" title={contact.company}>{contact.company}</td>
                <td className="data-secondary px-3 py-2 text-[13px] max-w-[160px] truncate" title={contact.industry}>
                  {contact.industry}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={`inline-flex px-1.5 py-0.5 text-[11px] font-medium ${TYPE_STYLES[contact.contactType] || TYPE_STYLES["Other"]}`}>
                    {contact.contactType}
                  </span>
                </td>
                <td className="px-3 py-2 w-[220px] max-w-[220px]">
                  <div className="flex flex-col gap-0.5">
                    {contact.email && (
                      <CopyEmail
                        email={contact.email}
                        className="text-[12px] text-accent hover:text-white transition-colors font-mono truncate block"
                      />
                    )}
                    {contact.altEmail && (
                      <CopyEmail
                        email={contact.altEmail}
                        className="text-[11px] text-muted hover:text-accent transition-colors font-mono truncate block"
                      />
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {contact.linkedin ? (
                    <a
                      href={
                        contact.linkedin.startsWith("http")
                          ? contact.linkedin
                          : `https://${contact.linkedin}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] text-accent hover:text-foreground transition-colors"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-[12px] text-muted">—</span>
                  )}
                </td>
                {editMode && (
                  <td className="px-3 py-2 whitespace-nowrap">
                    {typeof contact.supabaseId === "number" ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(contact)}
                          className="text-[12px] text-accent hover:text-foreground transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(contact.supabaseId as number)}
                          className="text-[12px] text-muted hover:text-foreground transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-[12px] text-muted">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingContact && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setEditingContact(null)}
        >
          <div 
            className="bg-card border border-card-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card border-b border-card-border px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Edit Contact</h3>
              <button
                onClick={() => setEditingContact(null)}
                className="text-muted hover:text-foreground transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted uppercase tracking-wide">First Name</label>
                  <input
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="px-3 py-2 rounded-md border border-card-border bg-background text-foreground text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted uppercase tracking-wide">Last Name</label>
                  <input
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="px-3 py-2 rounded-md border border-card-border bg-background text-foreground text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted uppercase tracking-wide">Company Name</label>
                  <input
                    value={editForm.companyName}
                    onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                    className="px-3 py-2 rounded-md border border-card-border bg-background text-foreground text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted uppercase tracking-wide">Industry</label>
                  <input
                    value={editForm.industry}
                    onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                    className="px-3 py-2 rounded-md border border-card-border bg-background text-foreground text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted uppercase tracking-wide">Email</label>
                  <input
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="px-3 py-2 rounded-md border border-card-border bg-background text-foreground text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted uppercase tracking-wide">LinkedIn</label>
                  <input
                    value={editForm.linkedin}
                    onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                    className="px-3 py-2 rounded-md border border-card-border bg-background text-foreground text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.isOTCRAlum}
                    onChange={(e) => setEditForm({ ...editForm, isOTCRAlum: e.target.checked })}
                    className="w-4 h-4 rounded border-card-border text-accent focus:ring-accent/50 cursor-pointer"
                  />
                  <label className="text-sm text-foreground">OTCR Alum</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.isUIUCAlum}
                    onChange={(e) => setEditForm({ ...editForm, isUIUCAlum: e.target.checked })}
                    className="w-4 h-4 rounded border-card-border text-accent focus:ring-accent/50 cursor-pointer"
                  />
                  <label className="text-sm text-foreground">UIUC Alum</label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingContact(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
