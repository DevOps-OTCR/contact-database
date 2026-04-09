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
    <div className="border-b border-card-border last:border-b-0">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-accent-soft transition-colors"
      >
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <svg
          className={`h-4 w-4 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="pb-3 px-4">{children}</div>}
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
    <label className="flex items-center gap-2 py-1.5 cursor-pointer group hover:text-foreground transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-card-border text-accent focus:ring-accent/50 focus:ring-1 cursor-pointer accent-accent"
      />
      <span className="text-sm text-muted group-hover:text-foreground flex-1">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-muted/60 font-mono">{count}</span>
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
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/15 text-accent text-xs"
            >
              {company}
              <button
                type="button"
                onClick={() => removeCompany(company)}
                className="hover:text-foreground rounded transition-colors"
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
          className="w-full px-3 py-2 bg-card border border-card-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50"
        />
        {showDropdown && (
          <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-card border border-card-border rounded-lg shadow-lg py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">
                {search.trim() ? "No companies match" : "All companies selected"}
              </li>
            ) : (
              filtered.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => addCompany(opt)}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent-soft transition-colors"
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
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/15 text-accent text-xs"
            >
              {industry}
              <button
                type="button"
                onClick={() => removeIndustry(industry)}
                className="hover:text-foreground rounded transition-colors"
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
          className="w-full px-3 py-2 bg-card border border-card-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50"
        />
        {showDropdown && (
          <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-card border border-card-border rounded-lg shadow-lg py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">
                {search.trim() ? "No industries match" : "All industries selected"}
              </li>
            ) : (
              filtered.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => addIndustry(opt)}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent-soft transition-colors"
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
    <div className="w-64 bg-card border-r border-card-border flex-shrink-0 h-full overflow-y-auto">
      <div className="sticky top-0 bg-card border-b border-card-border px-4 py-3 z-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-foreground">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={() =>
                onChange({
                  company: [],
                  industry: [],
                  alumniStatus: [],
                })
              }
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Reset All
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <p className="text-xs text-muted">
            {Object.values(filters).reduce((acc, v) => {
              if (Array.isArray(v)) return acc + v.length;
              return acc + (v ? 1 : 0);
            }, 0)}{" "}
            active
          </p>
        )}
      </div>

      <div className="divide-y divide-card-border">
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
