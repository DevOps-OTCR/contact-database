"use client";

import { useState, useRef, useEffect } from "react";
import { Filters } from "./Dashboard";
import { ALUMNI_STATUS_OPTIONS } from "@/lib/filterHelpers";

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  companies: string[];
  industries: string[];
}

function FilterSection({
  title,
  children,
  isOpen: controlledIsOpen,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const [internalOpen, setInternalOpen] = useState(true);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const toggle = onToggle || (() => setInternalOpen(!internalOpen));

  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="last:[border-bottom:none]">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between py-2 pr-3 pl-3 border-l-2 border-l-accent hover:bg-row-hover transition-colors"
      >
        <h3 className="text-[10px] font-semibold text-muted uppercase tracking-[0.1em]">{title}</h3>
        <svg
          className={`h-3 w-3 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="pb-2.5 px-3">{children}</div>}
    </div>
  );
}

function CheckboxFilter({
  label,
  checked,
  onChange,
  count,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  count?: number;
}) {
  return (
    <label className="flex items-center gap-2 py-1 cursor-pointer group hover:text-foreground transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-3.5 h-3.5 border border-card-border cursor-pointer flex-shrink-0"
        style={{ accentColor: "#3a96e5" }}
      />
      <span className="text-[12px] text-muted group-hover:text-foreground flex-1">{label}</span>
      {count !== undefined && (
        <span className="text-[11px] text-muted font-mono">{count}</span>
      )}
    </label>
  );
}

function CompanySearchFilter({
  value,
  onChange,
  options,
  placeholder = "Search companies...",
}: {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  placeholder?: string;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = value || [];
  const filtered = options.filter(
    (opt) =>
      opt.toLowerCase().includes(search.toLowerCase().trim()) && !selected.includes(opt)
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = open && (search.length > 0 || filtered.length <= 20);

  const addCompany = (company: string) => {
    if (!selected.includes(company)) {
      onChange([...selected, company]);
    }
    setSearch("");
    setOpen(false);
  };

  const removeCompany = (company: string) => {
    onChange(selected.filter((c) => c !== company));
  };

  return (
    <div ref={containerRef} className="relative space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((company) => (
            <span
              key={company}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0d2340] text-[#3a96e5] text-[11px]"
            >
              {company}
              <button
                type="button"
                onClick={() => removeCompany(company)}
                className="hover:text-foreground transition-colors"
                title="Remove"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full px-2.5 py-1.5 bg-sidebar border border-card-border text-[12px] text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
        />
        {showDropdown && (
          <ul className="absolute z-20 mt-0 w-full max-h-48 overflow-y-auto bg-sidebar border border-card-border py-0.5">
            {filtered.length === 0 ? (
              <li className="px-2.5 py-1.5 text-[12px] text-muted">
                {search.trim() ? "No companies match" : "All companies selected"}
              </li>
            ) : (
              filtered.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => addCompany(opt)}
                    className="w-full text-left px-2.5 py-1.5 text-[12px] text-foreground hover:bg-row-hover transition-colors"
                  >
                    {opt}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

function IndustrySearchFilter({
  value,
  onChange,
  options,
  placeholder = "Search industries...",
}: {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  placeholder?: string;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = value || [];
  const filtered = options
    .filter(Boolean)
    .filter(
      (opt) =>
        opt.toLowerCase().includes(search.toLowerCase().trim()) && !selected.includes(opt)
    );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = open && (search.length > 0 || filtered.length <= 30);

  const addIndustry = (industry: string) => {
    if (!selected.includes(industry)) {
      onChange([...selected, industry]);
    }
    setSearch("");
    setOpen(false);
  };

  const removeIndustry = (industry: string) => {
    onChange(selected.filter((i) => i !== industry));
  };

  return (
    <div ref={containerRef} className="relative space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((industry) => (
            <span
              key={industry}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0d2340] text-[#3a96e5] text-[11px]"
            >
              {industry}
              <button
                type="button"
                onClick={() => removeIndustry(industry)}
                className="hover:text-foreground transition-colors"
                title="Remove"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full px-2.5 py-1.5 bg-sidebar border border-card-border text-[12px] text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
        />
        {showDropdown && (
          <ul className="absolute z-20 mt-0 w-full max-h-48 overflow-y-auto bg-sidebar border border-card-border py-0.5">
            {filtered.length === 0 ? (
              <li className="px-2.5 py-1.5 text-[12px] text-muted">
                {search.trim() ? "No industries match" : "All industries selected"}
              </li>
            ) : (
              filtered.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => addIndustry(opt)}
                    className="w-full text-left px-2.5 py-1.5 text-[12px] text-foreground hover:bg-row-hover transition-colors"
                  >
                    {opt}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function FilterSidebar({
  filters,
  onChange,
  companies,
  industries,
}: FilterSidebarProps) {
  const hasActiveFilters = Object.values(filters).some((v) => {
    if (Array.isArray(v)) return v.length > 0;
    return Boolean(v);
  });

  const handleAlumniStatusToggle = (status: string) => {
    const currentStatuses = filters.alumniStatus || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];
    onChange({ ...filters, alumniStatus: newStatuses });
  };

  return (
    <div className="w-56 bg-sidebar flex-shrink-0 h-full overflow-y-auto">
      <div className="sticky top-0 bg-sidebar px-3 py-2.5 z-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold text-foreground uppercase tracking-[0.08em]">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={() =>
                onChange({
                  company: [],
                  industry: [],
                  alumniStatus: [],
                })
              }
              className="text-[11px] text-muted hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <p className="text-[11px] text-muted mt-0.5">
            {Object.values(filters).reduce((acc, v) => {
              if (Array.isArray(v)) return acc + v.length;
              return acc + (v ? 1 : 0);
            }, 0)}{" "}
            active
          </p>
        )}
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Company */}
        <FilterSection title="Current Company">
          <CompanySearchFilter
            value={filters.company || []}
            onChange={(value) => onChange({ ...filters, company: value })}
            options={companies}
            placeholder="Search companies..."
          />
        </FilterSection>

        {/* Industry */}
        <FilterSection title="Industry">
          <IndustrySearchFilter
            value={filters.industry || []}
            onChange={(value) => onChange({ ...filters, industry: value })}
            options={industries}
            placeholder="Search industries..."
          />
        </FilterSection>

        {/* Alumni Status */}
        <FilterSection title="Alumni Status">
          <div className="space-y-1">
            {ALUMNI_STATUS_OPTIONS.map((status) => (
              <CheckboxFilter
                key={status}
                label={status}
                checked={(filters.alumniStatus || []).includes(status)}
                onChange={() => handleAlumniStatusToggle(status)}
              />
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
