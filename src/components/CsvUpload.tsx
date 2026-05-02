"use client";

import { useState, useRef, useCallback } from "react";
import { Contact } from "@/lib/types";
import { supabase } from "@/lib/auth";

interface CsvUploadProps {
  onContactsImported: (contacts: Contact[]) => void;
}

interface ParsedRow {
  first_name: string;
  last_name: string;
  company_name: string;
  industry: string;
  email: string;
  alt_email: string;
  linkedin: string;
  role: string;
  is_otcr_alum: string;
  is_uiuc_alum: string;
  graduation_year: string;
  major: string;
}

interface ImportResult {
  added: number;
  skipped: number;
  errors: string[];
}

// ── CSV parser that handles quoted fields ──────────────────────────────────
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[\s_\-]/g, "");
}

// Maps a set of candidates (normalized) to the raw header key
function findColumn(headers: string[], ...candidates: string[]): string | undefined {
  const normalized = headers.map(normalizeHeader);
  for (const c of candidates) {
    const idx = normalized.indexOf(c);
    if (idx !== -1) return headers[idx];
  }
  return undefined;
}

function parseYesNo(val: string): "Yes" | "No" {
  const v = val.toLowerCase().trim();
  return v === "yes" || v === "true" || v === "1" || v === "y" ? "Yes" : "No";
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const rawHeaders = parseCSVLine(lines[0]);

  // Detect column mapping
  const col = {
    firstName:      findColumn(rawHeaders, "firstname", "first_name", "fname"),
    lastName:       findColumn(rawHeaders, "lastname", "last_name", "lname"),
    fullName:       findColumn(rawHeaders, "name", "fullname", "full_name"),
    company:        findColumn(rawHeaders, "company", "companyname", "organization", "employer"),
    industry:       findColumn(rawHeaders, "industry", "sector", "field"),
    email:          findColumn(rawHeaders, "email", "emailaddress", "email1"),
    altEmail:       findColumn(rawHeaders, "altemail", "alt_email", "email2", "alternativeemail", "secondaryemail"),
    linkedin:       findColumn(rawHeaders, "linkedin", "linkedinurl", "linkedinprofile"),
    role:           findColumn(rawHeaders, "role", "title", "jobtitle", "position"),
    isOTCR:         findColumn(rawHeaders, "isotcralum", "otcr", "otcralum", "isotcr"),
    isUIUC:         findColumn(rawHeaders, "isuiucalum", "uiuc", "uiucalum", "isuiuc"),
    gradYear:       findColumn(rawHeaders, "graduationyear", "gradyear", "year", "classyear"),
    major:          findColumn(rawHeaders, "major", "concentration"),
  };

  const get = (row: Record<string, string>, key: string | undefined) =>
    key ? (row[key] ?? "") : "";

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    rawHeaders.forEach((h, i) => { row[h] = values[i] ?? ""; });

    // Resolve first/last name
    let firstName = get(row, col.firstName);
    let lastName = get(row, col.lastName);
    if (!firstName && !lastName) {
      const parts = get(row, col.fullName).trim().split(/\s+/);
      firstName = parts[0] ?? "";
      lastName = parts.slice(1).join(" ");
    }

    return {
      first_name:      firstName,
      last_name:       lastName,
      company_name:    get(row, col.company),
      industry:        get(row, col.industry),
      email:           get(row, col.email),
      alt_email:       get(row, col.altEmail),
      linkedin:        get(row, col.linkedin),
      role:            get(row, col.role),
      is_otcr_alum:    parseYesNo(get(row, col.isOTCR)),
      is_uiuc_alum:    parseYesNo(get(row, col.isUIUC)),
      graduation_year: get(row, col.gradYear),
      major:           get(row, col.major),
    };
  }).filter((r) => r.email || r.first_name || r.company_name);
}

// ── Component ──────────────────────────────────────────────────────────────

export default function CsvUpload({ onContactsImported }: CsvUploadProps) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      alert("Please upload a .csv file.");
      return;
    }
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleImport = async () => {
    if (!supabase || rows.length === 0) return;
    setImporting(true);
    const result: ImportResult = { added: 0, skipped: 0, errors: [] };
    const newContacts: Contact[] = [];

    // Batch insert in chunks of 50
    const BATCH = 50;
    for (let i = 0; i < rows.length; i += BATCH) {
      const chunk = rows.slice(i, i + BATCH).map((r) => ({
        first_name:   r.first_name || null,
        last_name:    r.last_name || null,
        company_name: r.company_name || null,
        industry:     r.industry || null,
        email:        r.email || null,
        linkedin:     r.linkedin || null,
        is_otcr_alum: r.is_otcr_alum,
        is_uiuc_alum: r.is_uiuc_alum,
      }));

      const { data, error } = await supabase
        .from("contacts")
        .insert(chunk)
        .select("*");

      if (error) {
        result.errors.push(`Rows ${i + 1}–${i + chunk.length}: ${error.message}`);
        result.skipped += chunk.length;
      } else if (data) {
        result.added += data.length;
        data.forEach((row: Record<string, unknown>, idx: number) => {
          const src = rows[i + idx];
          const isOTCR = src.is_otcr_alum === "Yes";
          const isUIUC = src.is_uiuc_alum === "Yes";
          newContacts.push({
            id: Date.now() + i + idx,
            supabaseId: typeof row.id === "number" ? row.id : undefined,
            name: `${src.first_name} ${src.last_name}`.trim() || "N/A",
            company: src.company_name,
            role: src.role,
            email: src.email,
            altEmail: src.alt_email,
            linkedin: src.linkedin || undefined,
            isOTCR,
            isUIUC,
            contactType: isOTCR && isUIUC ? "OTCR & UIUC" : isOTCR ? "OTCR Only" : isUIUC ? "UIUC Only" : "Other",
            industry: src.industry || undefined,
            graduationYear: src.graduation_year ? parseInt(src.graduation_year) || undefined : undefined,
            major: src.major || undefined,
          });
        });
      }
    }

    setResult(result);
    setImporting(false);
    if (newContacts.length > 0) onContactsImported(newContacts);
    if (result.errors.length === 0) {
      setRows([]);
      setFileName("");
    }
  };

  const reset = () => {
    setRows([]);
    setFileName("");
    setResult(null);
  };

  // ── Idle / drop zone ────────────────────────────────────────────────────
  if (rows.length === 0 && !result) {
    return (
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileRef.current?.click()}
        className="cursor-pointer flex flex-col items-center justify-center gap-2 py-6 border transition-colors"
        style={{
          borderStyle: "dashed",
          borderColor: dragOver ? "#3a96e5" : "#162030",
          background: dragOver ? "rgba(58,150,229,0.05)" : "rgba(7,18,32,0.7)",
        }}
      >
        <svg className="h-6 w-6" style={{ color: dragOver ? "#3a96e5" : "#5a7090" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-[12px] text-foreground font-medium">Drop a CSV file here, or click to browse</p>
        <p className="text-[11px] text-muted">Accepts: first_name, last_name, company, industry, email, linkedin, is_otcr_alum, is_uiuc_alum</p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
    );
  }

  // ── Result state ────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="border border-card-border px-4 py-3 flex items-center justify-between gap-4" style={{ background: "rgba(7,18,32,0.9)" }}>
        <div className="flex items-center gap-4">
          {result.added > 0 && (
            <span className="text-[12px] font-medium" style={{ color: "#3a96e5" }}>
              ✓ {result.added} contact{result.added !== 1 ? "s" : ""} imported
            </span>
          )}
          {result.skipped > 0 && (
            <span className="text-[12px] text-muted">{result.skipped} skipped</span>
          )}
          {result.errors.length > 0 && (
            <span className="text-[12px]" style={{ color: "#c07070" }}>{result.errors[0]}</span>
          )}
        </div>
        <button onClick={reset} className="text-[11px] text-muted hover:text-foreground transition-colors">
          Import another
        </button>
      </div>
    );
  }

  // ── Preview state ───────────────────────────────────────────────────────
  const preview = rows.slice(0, 6);

  return (
    <div className="border border-card-border flex flex-col" style={{ background: "rgba(7,18,32,0.9)" }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-card-border">
        <div className="flex items-center gap-3">
          <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[12px] font-medium text-foreground">{fileName}</span>
          <span className="text-[11px] px-2 py-0.5" style={{ background: "#0d2340", color: "#3a96e5", border: "1px solid rgba(58,150,229,0.2)" }}>
            {rows.length} rows
          </span>
        </div>
        <button onClick={reset} className="text-[11px] text-muted hover:text-foreground transition-colors">
          Cancel
        </button>
      </div>

      {/* Mini preview table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-[11px]">
          <thead>
            <tr className="border-b border-card-border">
              {["Name", "Company", "Industry", "Email", "OTCR", "UIUC"].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-muted font-semibold uppercase tracking-[0.07em] whitespace-nowrap"
                  style={{ fontSize: "10px" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i} className="border-b border-card-border last:border-b-0">
                <td className="data-primary px-3 py-1.5 whitespace-nowrap">
                  {[row.first_name, row.last_name].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="data-secondary px-3 py-1.5 max-w-[140px] truncate">{row.company_name || "—"}</td>
                <td className="data-secondary px-3 py-1.5 max-w-[120px] truncate">{row.industry || "—"}</td>
                <td className="px-3 py-1.5 max-w-[180px] truncate" style={{ color: "#3a96e5" }}>{row.email || "—"}</td>
                <td className="data-secondary px-3 py-1.5">{row.is_otcr_alum}</td>
                <td className="data-secondary px-3 py-1.5">{row.is_uiuc_alum}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > 6 && (
          <p className="px-3 py-2 text-[11px] text-muted border-t border-card-border">
            + {rows.length - 6} more rows not shown
          </p>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-card-border">
        <p className="text-[11px] text-muted">
          All {rows.length} rows will be inserted into Supabase.
        </p>
        <button
          onClick={handleImport}
          disabled={importing}
          className="text-[12px] font-medium px-3 py-1.5 transition-colors disabled:opacity-50"
          style={{ background: "#3a96e5", color: "#fff" }}
          onMouseOver={(e) => { if (!importing) (e.target as HTMLElement).style.background = "#2a80d0"; }}
          onMouseOut={(e) => { (e.target as HTMLElement).style.background = "#3a96e5"; }}
        >
          {importing ? "Importing…" : `Import ${rows.length} contacts`}
        </button>
      </div>
    </div>
  );
}
